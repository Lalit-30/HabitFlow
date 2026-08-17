from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.category import CategoryCreateRequest, CategoryResponse
from app.services.habit_service import HabitService
from app.api.deps import get_current_user
from app.models.user import User

router = APIRouter()


@router.get("", response_model=List[CategoryResponse], status_code=status.HTTP_200_OK)
def get_categories(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    List all predefined system categories and custom user categories.
    """
    return HabitService.list_categories(db, user_id=current_user.id)


@router.post("", response_model=CategoryResponse, status_code=status.HTTP_201_CREATED)
def create_custom_category(
    request: CategoryCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a new custom category for the authenticated user.
    """
    return HabitService.create_category(db, user_id=current_user.id, request=request)
