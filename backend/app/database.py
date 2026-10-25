import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

load_dotenv()

_raw_url = os.getenv("DATABASE_URL", "sqlite:///./loanlens.db")

# The team's .env uses async drivers; this backend uses sync SQLAlchemy.
DATABASE_URL = (
    _raw_url
    .replace("postgresql+asyncpg://", "postgresql+psycopg2://")
    .replace("sqlite+aiosqlite://", "sqlite://")
)

connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)


class Base(DeclarativeBase):
    pass


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()