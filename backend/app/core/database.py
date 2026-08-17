import os
from typing import Generator
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base, Session
from app.core.config import settings

# Determine database URL with Vercel serverless writable /tmp directory fallback
db_url = settings.DATABASE_URL

# On Vercel serverless environments, root app directory is read-only; use /tmp directory
if os.environ.get("VERCEL") or (db_url == "sqlite:///./habit_tracker.db" and os.name != "nt"):
    db_url = "sqlite:////tmp/habit_tracker.db"

engine_kwargs = {}
if db_url.startswith("sqlite"):
    engine_kwargs["connect_args"] = {"check_same_thread": False}

engine = create_engine(
    db_url,
    pool_pre_ping=True,
    **engine_kwargs
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db() -> Generator[Session, None, None]:
    """
    FastAPI dependency that provides a transactional database session per HTTP request.
    Ensures that the session is properly closed after the request is finished.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
