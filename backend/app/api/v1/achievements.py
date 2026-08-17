from typing import List, Dict, Any
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.services.gamification_service import GamificationService
from app.api.deps import get_current_user
from app.models.user import User

router = APIRouter()


@router.get("", status_code=status.HTTP_200_OK)
def get_achievements(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    List all available achievements and current user's unlock statuses and badges.
    """
    return GamificationService.get_user_achievements(db, user=current_user)
