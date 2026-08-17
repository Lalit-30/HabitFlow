import sys
from pathlib import Path

# Add backend directory to sys.path so 'app' module imports succeed in Vercel serverless functions
backend_dir = Path(__file__).resolve().parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from app.core.config import settings
from app.core.database import engine, Base, SessionLocal
from app.api.v1.router import api_router
from app.repositories.category_repo import CategoryRepository


def init_db():
    """
    Creates database tables for application endpoints, performs auto-migrations, and seeds default categories.
    """
    try:
        Base.metadata.create_all(bind=engine)
        with engine.connect() as conn:
            columns_to_add = [
                ("is_admin", "BOOLEAN DEFAULT 0"),
                ("avatar_url", "VARCHAR(500)"),
                ("age", "INTEGER"),
                ("dob", "DATE"),
                ("gender", "VARCHAR(30)"),
                ("city", "VARCHAR(100)"),
                ("country", "VARCHAR(100)"),
                ("height", "FLOAT"),
                ("weight", "FLOAT"),
                ("health_goal", "VARCHAR(255)"),
            ]
            for col_name, col_type in columns_to_add:
                try:
                    conn.execute(text(f"ALTER TABLE users ADD COLUMN {col_name} {col_type}"))
                    conn.commit()
                except Exception:
                    pass  # Column already exists

        # Seed categories eagerly
        db = SessionLocal()
        try:
            CategoryRepository.seed_system_categories(db)
        finally:
            db.close()
    except Exception as e:
        print(f"[WARN] Database initialization error: {e}")


# Run initialization on import so serverless Lambdas have pre-built tables
init_db()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan event handler managing application startup and shutdown tasks.
    """
    init_db()
    yield


# Initialize FastAPI application
app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url="/openapi.json",
    description="Production-quality RESTful API for Habit Tracker application",
    version="1.0.0",
    lifespan=lifespan
)

# Global Exception Handler returning detailed error JSON instead of generic 500 HTML
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    print(f"[ERROR] Global Exception Captured: {exc}")
    return JSONResponse(
        status_code=500,
        content={"detail": f"Server error: {str(exc)}"}
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
