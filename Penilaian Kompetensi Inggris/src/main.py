from contextlib import asynccontextmanager
from fastapi import FastAPI
from functools import lru_cache

from src.config import Settings
from src.model import router, CompetenceModel
from src.globals import g, GlobalsMiddleware

import torch
import os


@lru_cache
def get_settings():
    return Settings()

@lru_cache
def get_globals():
    return g

@asynccontextmanager
async def lifespan(app: FastAPI):
    settings = get_settings()
    g = get_globals()

    g.set_default("device", torch.device("cuda" if torch.cuda.is_available() else "cpu"))

    cm_model_path = settings.get_model_path()
    if not os.path.exists(cm_model_path):
        raise FileNotFoundError(f"Model not found at {cm_model_path}")

    model = CompetenceModel.load(cm_model_path, settings.cm_model_type, 
                                 state_dict_path=settings.get_state_dict_path(), device=g.device)
    
    g.set_default("model", model)
    
    yield
    del g

app = FastAPI(
    title="FastAPI",
    lifespan=lifespan,
    responses={404: {"description": "Not found"}},
)

app.add_middleware(GlobalsMiddleware)

app.include_router(router.router)