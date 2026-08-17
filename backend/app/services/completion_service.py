from typing import List, Optional
from datetime import date
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.repositories.habit_repo import HabitRepository
from app.repositories.completion_repo import CompletionRepository
from app.repositories.user_repo import UserRepository
from app.schemas.completion import HabitCompletionToggleRequest, HabitCompletionResponse
from app.models.completion import HabitCompletion


class CompletionService:
    @staticmethod
    def toggle_completion(
        db: Session,
        user_id: str,
        habit_id: str,
        request: HabitCompletionToggleRequest
    ) -> HabitCompletionResponse:
        # Enforce multi-tenant habit ownership
        habit = HabitRepository.get_by_id_and_user(db, habit_id=habit_id, user_id=user_id)
        if not habit:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Habit with ID '{habit_id}' not found."
            )

        if request.completed_date < habit.start_date:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot log completion prior to habit start date ({habit.start_date})."
            )

        # Check if completed for first time to award XP
        existing = CompletionRepository.get_by_habit_and_date(db, user_id, habit_id, request.completed_date)
        is_first_completion = existing is None and request.status == "completed"

        completion = CompletionRepository.create_or_update(
            db=db,
            user_id=user_id,
            habit_id=habit_id,
            completed_date=request.completed_date,
            status=request.status,
            notes=request.notes
        )

        if is_first_completion:
            # Award +10 XP to user
            user = UserRepository.get_by_id(db, user_id)
            if user:
                user.xp += 10
                # Calculate level: Level = floor(sqrt(XP / 50)) + 1
                user.level = int((user.xp / 50) ** 0.5) + 1
                db.commit()

        return HabitCompletionResponse.model_validate(completion)

    @staticmethod
    def delete_completion(
        db: Session,
        user_id: str,
        habit_id: str,
        completed_date: date
    ) -> dict:
        habit = HabitRepository.get_by_id_and_user(db, habit_id=habit_id, user_id=user_id)
        if not habit:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Habit with ID '{habit_id}' not found."
            )

        deleted = CompletionRepository.delete(db, user_id=user_id, habit_id=habit_id, completed_date=completed_date)
        if not deleted:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"No completion record found for habit '{habit_id}' on date '{completed_date}'."
            )
        return {"message": f"Completion record for date '{completed_date}' successfully removed."}

    @staticmethod
    def list_completions(
        db: Session,
        user_id: str,
        habit_id: str,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None
    ) -> List[HabitCompletionResponse]:
        habit = HabitRepository.get_by_id_and_user(db, habit_id=habit_id, user_id=user_id)
        if not habit:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Habit with ID '{habit_id}' not found."
            )

        completions = CompletionRepository.list_for_habit(db, habit_id=habit_id, start_date=start_date, end_date=end_date)
        return [HabitCompletionResponse.model_validate(c) for c in completions]
