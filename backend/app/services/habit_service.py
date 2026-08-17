from typing import List, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.repositories.habit_repo import HabitRepository
from app.repositories.category_repo import CategoryRepository
from app.schemas.habit import HabitCreateRequest, HabitUpdateRequest, HabitResponse
from app.schemas.category import CategoryCreateRequest, CategoryResponse
from app.models.habit import Habit


class HabitService:
    @staticmethod
    def list_categories(db: Session, user_id: str) -> List[CategoryResponse]:
        categories = CategoryRepository.list_all_for_user(db, user_id=user_id)
        return [CategoryResponse.model_validate(c) for c in categories]

    @staticmethod
    def create_category(db: Session, user_id: str, request: CategoryCreateRequest) -> CategoryResponse:
        category = CategoryRepository.create_custom(
            db=db,
            user_id=user_id,
            name=request.name,
            icon=request.icon,
            color=request.color
        )
        return CategoryResponse.model_validate(category)

    @staticmethod
    def to_habit_response(habit: Habit) -> HabitResponse:
        scheduled_days = [s.day_of_week for s in habit.schedules] if habit.schedules else []
        response_data = HabitResponse.model_validate(habit)
        response_data.scheduled_days = sorted(scheduled_days)
        return response_data

    @staticmethod
    def list_user_habits(
        db: Session,
        user_id: str,
        is_archived: Optional[bool] = False,
        category_id: Optional[str] = None
    ) -> List[HabitResponse]:
        habits = HabitRepository.list_by_user(db, user_id=user_id, is_archived=is_archived, category_id=category_id)
        return [HabitService.to_habit_response(h) for h in habits]

    @staticmethod
    def create_habit(db: Session, user_id: str, request: HabitCreateRequest) -> HabitResponse:
        # Verify category exists
        category = CategoryRepository.get_by_id(db, request.category_id)
        if not category:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Category with ID '{request.category_id}' does not exist."
            )
        
        habit = HabitRepository.create(db, user_id=user_id, request=request)
        return HabitService.to_habit_response(habit)

    @staticmethod
    def get_habit(db: Session, user_id: str, habit_id: str) -> HabitResponse:
        habit = HabitRepository.get_by_id_and_user(db, habit_id=habit_id, user_id=user_id)
        if not habit:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Habit with ID '{habit_id}' not found."
            )
        return HabitService.to_habit_response(habit)

    @staticmethod
    def update_habit(db: Session, user_id: str, habit_id: str, request: HabitUpdateRequest) -> HabitResponse:
        habit = HabitRepository.get_by_id_and_user(db, habit_id=habit_id, user_id=user_id)
        if not habit:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Habit with ID '{habit_id}' not found."
            )
        
        if request.category_id:
            category = CategoryRepository.get_by_id(db, request.category_id)
            if not category:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Category with ID '{request.category_id}' does not exist."
                )

        updated_habit = HabitRepository.update(db, habit=habit, request=request)
        return HabitService.to_habit_response(updated_habit)

    @staticmethod
    def archive_habit(db: Session, user_id: str, habit_id: str) -> HabitResponse:
        habit = HabitRepository.get_by_id_and_user(db, habit_id=habit_id, user_id=user_id)
        if not habit:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Habit with ID '{habit_id}' not found."
            )
        archived = HabitRepository.archive(db, habit)
        return HabitService.to_habit_response(archived)

    @staticmethod
    def restore_habit(db: Session, user_id: str, habit_id: str) -> HabitResponse:
        habit = HabitRepository.get_by_id_and_user(db, habit_id=habit_id, user_id=user_id)
        if not habit:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Habit with ID '{habit_id}' not found."
            )
        restored = HabitRepository.restore(db, habit)
        return HabitService.to_habit_response(restored)

    @staticmethod
    def delete_habit(db: Session, user_id: str, habit_id: str) -> dict:
        habit = HabitRepository.get_by_id_and_user(db, habit_id=habit_id, user_id=user_id)
        if not habit:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Habit with ID '{habit_id}' not found."
            )
        HabitRepository.delete(db, habit)
        return {"message": f"Habit '{habit_id}' successfully deleted."}
