from pydantic import BaseModel


class PredictData(BaseModel):
    transcripts: list[str]
    competence_sets: list[list[str]]
