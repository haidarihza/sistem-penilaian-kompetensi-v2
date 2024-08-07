from fastapi import APIRouter, Depends
from functools import lru_cache
from sqlalchemy.orm import Session
from typing import Annotated

from src.config import Settings
from src.database import base, models
from src.model import BayesianCompetenceModel, CompetenceModel, get_powerbald_batch, schemas, TCDataset
from src.globals import g

import time
import torch
import os


@lru_cache
def get_settings():
    return Settings()

def get_db():
    db = base.SessionLocal()
    try:
        yield db
    finally:
        db.close()


router = APIRouter(
    prefix="/model",
    responses={404: {"description": "Not found"}},
)


@router.get("/")
async def read_model(settings: Annotated[Settings, Depends(get_settings)]):
    return {
        "model_name": settings.cm_model_name,
        "state_dict": settings.cm_state_dict_filename,
    }


@router.post("/save")
async def save_model(settings: Annotated[Settings, Depends(get_settings)]):
    filename = f"{int(time.time())}.pt"
    state_dict_path = os.path.join(settings.get_state_dict_dir(), filename)

    g.model.save_state_dict(state_dict_path)

    settings.cm_state_dict_filename = filename
    settings.update_json()

    return {
        "message": f"Model state dict saved at {state_dict_path}. Also updated state dict filename in config.json."
    }


@router.post("/reload")
async def reload_model(settings: Annotated[Settings, Depends(get_settings)]):
    path = settings.get_state_dict_path()
    g.model.load_state_dict(path)

    return {
        "message": f"Model state dict reloaded from {path}."
    }


@router.post("/predict")
async def predict_model(predict_data: schemas.PredictData):
    g.model.eval()
    with torch.no_grad():
        scores = g.model(predict_data.transcripts, predict_data.competence_sets)
    
    return {
        "scores": scores.tolist()
    }


@router.post("/train")
async def train_model(settings: Annotated[Settings, Depends(get_settings)], db: Session = Depends(get_db)):
    feedback_results = db.query(models.FeedbackResult).filter(models.FeedbackResult.status == "LABELED", models.FeedbackResult.language == "ENGLISH").all()
    competency_levels = db.query(models.CompetencyLevel).all()

    if len(feedback_results) == 0:
        return {
            "message": "No labeled data available."
        }

    transcripts = [fr.transcript for fr in feedback_results]
    competence_sets = [[cl.description for cl in competency_levels if cl.competency_id == fr.competency_id] for fr in feedback_results]
    
    competence_set_ids = [[cl.competency_id for cl in competency_levels if cl.competency_id == fr.competency_id] for fr in feedback_results]
    label_ids = [fr.competency_id for fr in feedback_results]
    label_indices = [competence_set_ids[i].index(label_ids[i]) for i in range(len(label_ids))]

    dataset = TCDataset(transcripts, competence_sets, label_indices)
    train_dataset, eval_dataset = torch.utils.data.random_split(dataset, [settings.train_split_size, 1 - settings.train_split_size])
    
    new_model = CompetenceModel.load(settings.get_model_path(), settings.cm_model_type, state_dict_path=None, device=g.device)
    new_model.train()
    new_model.fit(train_dataset, eval_dataset, epochs=settings.train_max_epochs, batch_size=settings.train_batch_size, early_stop=settings.train_early_stop)

    filename = f"{int(time.time())}.pt"
    state_dict_path = os.path.join(settings.get_state_dict_dir(), filename)
    new_model.save_state_dict(state_dict_path)

    g.model = new_model

    settings.cm_state_dict_filename = filename
    settings.update_json()

    return {
        "message": f"Model has been trained and state dict saved at {state_dict_path}."
    }


@router.get("/to-label")
async def get_to_label_data(settings: Annotated[Settings, Depends(get_settings)], db: Session = Depends(get_db)):
    feedback_results = db.query(models.FeedbackResult).filter(models.FeedbackResult.status == "UNLABELED", models.FeedbackResult.language == "ENGLISH").all()
    competency_levels = db.query(models.CompetencyLevel).all()

    transcripts = [fr.transcript for fr in feedback_results]
    competence_sets = [[cl.description for cl in competency_levels if cl.competency_id == fr.competency_id] for fr in feedback_results]

    bayesian_model = BayesianCompetenceModel(g.model)
    bayesian_model.eval()

    with torch.no_grad():
        # Split to minimize GPU RAM usage
        # scores = []
        # n, s = len(feedback_results), 4
        # for i in range(0, n, s):
        #     score = bayesian_model(transcripts[i:min(i+s, n)], competence_sets[i:min(i+s, n)], k=settings.al_bayesian_samples, tokenizer_padding="max_length")
        #     scores.append(score)
        # scores = torch.cat(scores)  # Concatenate the scores, consider for scores of different sizes (of competence numebr in set)

        scores = bayesian_model(transcripts, competence_sets, k=settings.al_bayesian_samples)
        log_scores = torch.log(scores)
        batch = get_powerbald_batch(log_scores, batch_size=settings.al_batch_size)

    feedbacks = {
        "id": [feedback_results[i].id for i in batch.indices],
        "scores": batch.scores,
    }

    return feedbacks

