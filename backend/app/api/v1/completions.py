from typing import List, Optional
from datetime import date
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.completion import HabitCompletionToggleRequest, HabitCompletionResponse
from app.services.completion_service import CompletionService
from app.api.deps import get_current_user
from app.models.user import User

router = APIRouter()


@router.post("/{id}/complete", response_model=HabitCompletionResponse, status_code=status.HTTP_200_OK)
def complete_habit(
    id: str,
    request: HabitCompletionToggleRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Mark a habit as completed or skipped for a specific date.
    Idempotent: repeating for the same date updates the completion state.
    """
    return CompletionService.toggle_completion(
        db,
        user_id=current_user.id,
        habit_id=id,
        request=request
    )


@router.delete("/{id}/complete/{completed_date}", status_code=status.HTTP_200_OK)
def remove_habit_completion(
    id: str,
    completed_date: date,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Remove/unmark habit completion log for a specific date.
    """
    return CompletionService.delete_completion(
        db,
        user_id=current_user.id,
        habit_id=id,
        completed_date=completed_date
    )


@router.get("/{id}/completions", response_model=List[HabitCompletionResponse], status_code=status.HTTP_200_OK)
def get_habit_completion_history(
    id: str,
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get historical completion logs for a habit.
    """
    return CompletionService.list_completions(
        db,
        user_id=current_user.id,
        habit_id=id,
        start_date=start_date,
        end_date=end_date
    )
