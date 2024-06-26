from sqlalchemy import Column, ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID

from src.database.base import Base


class Competency(Base):
    __tablename__ = "competencies"

    id = Column(UUID, primary_key=True)
    competency = Column(String)


class CompetencyLevel(Base):
    __tablename__ = "competency_levels"

    id = Column(UUID, primary_key=True)
    competency_id = Column(UUID, ForeignKey("competencies.id"))
    level = Column(String)
    description = Column(String)


class FeedbackResult(Base):
    __tablename__ = "feedback_results"

    id = Column(UUID, primary_key=True)
    transcript = Column(String)
    competency_id = Column(UUID, ForeignKey("competencies.id"))
    status = Column(String, index=True)
    label_feedback = Column(UUID, ForeignKey("competency_levels.id"))
