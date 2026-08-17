import sys
from pathlib import Path

# Add backend directory to sys.path so 'app' module imports succeed in Vercel serverless functions
backend_dir = Path(__file__).resolve().parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import engine, Base, SessionLocal
from app.api.v1.router import api_router
from app.models.user import User
from app.core.security import get_password_hash


def init_db_and_seed():
    """
    Eagerly creates database tables and seeds/synchronizes initial admin and demo user accounts.
    """
    try:
        Base.metadata.create_all(bind=engine)
        db = SessionLocal()
        try:
            # Seed / Synchronize Admin user with updated credentials
            admin = db.query(User).filter(User.email == "admin@habitflow.com").first()
            if not admin:
                admin = User(
                    email="admin@habitflow.com",
                    hashed_password=get_password_hash("Admin@2026"),
                    full_name="System Administrator",
                    is_admin=True
                )
                db.add(admin)
            else:
                admin.hashed_password = get_password_hash("Admin@2026")
                admin.is_admin = True

            # Seed / Synchronize Demo user
            demo = db.query(User).filter(User.email == "demo@habitflow.com").first()
            if not demo:
                demo = User(
                    email="demo@habitflow.com",
                    hashed_password=get_password_hash("demopassword123"),
                    full_name="Demo User",
                    is_admin=False
                )
                db.add(demo)
            else:
                demo.hashed_password = get_password_hash("demopassword123")

            db.commit()
        finally:
            db.close()
    except Exception as e:
        print(f"[WARN] Database initialization error: {e}")


# Run initialization on import so serverless Lambdas have pre-built tables
init_db_and_seed()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan event handler managing application startup and shutdown tasks.
    """
    init_db_and_seed()
    yield


# Initialize FastAPI application
app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url="/openapi.json",
    description="Production-quality RESTful API for Habit Tracker application",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API v1 router with multiple prefix variants for Vercel Serverless & Local Uvicorn compatibility
app.include_router(api_router, prefix="/api/v1")
app.include_router(api_router, prefix="/v1")
app.include_router(api_router, prefix="")


@app.get("/", tags=["system"])
def read_root():
    """
    Root entrypoint returning API metadata.
    """
    return {
        "name": settings.PROJECT_NAME,
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health"
    }


@app.get("/health", tags=["system"])
def health_check():
    """
    Health check endpoint for Docker container probes and status monitoring.
    """
    return {"status": "healthy", "database": "connected"}
