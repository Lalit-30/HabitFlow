from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.habit import HabitCreateRequest, HabitUpdateRequest, HabitResponse
from app.services.habit_service import HabitService
from app.api.deps import get_current_user
from app.models.user import User

router = APIRouter()


@router.get("", response_model=List[HabitResponse], status_code=status.HTTP_200_OK)
def list_habits(
    is_archived: Optional[bool] = Query(False, description="Filter by archived status"),
    category_id: Optional[str] = Query(None, description="Filter by category ID"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    List habits for the current authenticated user with optional filtering.
    """
    return HabitService.list_user_habits(
        db,
        user_id=current_user.id,
        is_archived=is_archived,
        category_id=category_id
    )


@router.post("", response_model=HabitResponse, status_code=status.HTTP_201_CREATED)
def create_habit(
    request: HabitCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a new habit with schedule for the authenticated user.
    """
    return HabitService.create_habit(db, user_id=current_user.id, request=request)


@router.get("/{id}", response_model=HabitResponse, status_code=status.HTTP_200_OK)
def get_habit_details(
    id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get detailed information for a specific habit.
    """
    return HabitService.get_habit(db, user_id=current_user.id, habit_id=id)


@router.put("/{id}", response_model=HabitResponse, status_code=status.HTTP_200_OK)
def update_habit(
    id: str,
    request: HabitUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update habit attributes or schedule.
    """
    return HabitService.update_habit(db, user_id=current_user.id, habit_id=id, request=request)


@router.patch("/{id}/archive", response_model=HabitResponse, status_code=status.HTTP_200_OK)
def archive_habit(
    id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Soft-archive a habit.
    """
    return HabitService.archive_habit(db, user_id=current_user.id, habit_id=id)


@router.patch("/{id}/restore", response_model=HabitResponse, status_code=status.HTTP_200_OK)
def restore_archived_habit(
    id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Restore an archived habit.
    """
    return HabitService.restore_habit(db, user_id=current_user.id, habit_id=id)


@router.delete("/{id}", status_code=status.HTTP_200_OK)
def delete_habit(
    id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Permanently delete a habit.
    """
    return HabitService.delete_habit(db, user_id=current_user.id, habit_id=id)


@router.get("/{id}/statistics", status_code=status.HTTP_200_OK)
def get_habit_statistics(
    id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get streak statistics (current streak, best streak, completion %) for a habit.
    """
    habit_resp = HabitService.get_habit(db, user_id=current_user.id, habit_id=id)
    from app.repositories.habit_repo import HabitRepository
    from app.services.streak_service import StreakService
    
    habit = HabitRepository.get_by_id_and_user(db, habit_id=id, user_id=current_user.id)
    stats = StreakService.calculate_habit_stats(db, habit=habit)
    return stats
