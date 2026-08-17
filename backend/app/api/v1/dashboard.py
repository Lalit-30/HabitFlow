from typing import Optional
from datetime import date
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.services.dashboard_service import DashboardService
from app.api.deps import get_current_user
from app.models.user import User

router = APIRouter()


@router.get("", status_code=status.HTTP_200_OK)
def get_dashboard_summary(
    target_date: Optional[date] = Query(None, alias="date", description="Target date for dashboard (defaults to today)"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get overall dashboard overview including today's progress, max streaks, scheduled habits, and recent activity.
    """
    return DashboardService.get_dashboard_summary(db, user_id=current_user.id, target_date=target_date)
