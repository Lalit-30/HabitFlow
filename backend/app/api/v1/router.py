from fastapi import APIRouter
from app.api.v1 import auth, categories, habits, completions, dashboard, calendar, analytics, achievements, admin

api_router = APIRouter()

# Include sub-routers
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(categories.router, prefix="/categories", tags=["Categories"])
api_router.include_router(habits.router, prefix="/habits", tags=["Habits"])
api_router.include_router(completions.router, prefix="/habits", tags=["Completions"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["Dashboard"])
api_router.include_router(calendar.router, prefix="/calendar", tags=["Calendar"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["Analytics"])
api_router.include_router(achievements.router, prefix="/achievements", tags=["Achievements"])
api_router.include_router(admin.router, prefix="", tags=["Admin"])


@api_router.get("/status", tags=["System"])
def get_api_status():
    """
    Returns API v1 system status.
    """
    return {"status": "online", "version": "v1"}
