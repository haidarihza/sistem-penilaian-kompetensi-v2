from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

from src.config import Settings


s = Settings()
SQLALCHEMY_DATABASE_URL = f"postgresql+psycopg2://{s.database_user}:{s.database_password}@{s.database_host}:{s.database_port}/{s.database_name}"

engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()
