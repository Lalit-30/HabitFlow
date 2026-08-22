from typing import List, Optional
from datetime import date
from sqlalchemy.orm import Session
from app.models.completion import HabitCompletion


class CompletionRepository:
    @staticmethod
    def get_by_habit_and_date(
        db: Session,
        user_id: str,
        habit_id: str,
        completed_date: date
    ) -> Optional[HabitCompletion]:
        """
        Fetch completion record for a specific user, habit, and date.
        """
        return db.query(HabitCompletion).filter(
            HabitCompletion.user_id == user_id,
            HabitCompletion.habit_id == habit_id,
            HabitCompletion.completed_date == completed_date
        ).first()

    @staticmethod
    def create_or_update(
        db: Session,
        user_id: str,
        habit_id: str,
        completed_date: date,
        status: str = "completed",
        notes: Optional[str] = None
    ) -> HabitCompletion:
        """
        Idempotent creation or update of habit completion record for a specific date.
        """
        existing = CompletionRepository.get_by_habit_and_date(db, user_id, habit_id, completed_date)
        if existing:
            existing.status = status
            existing.notes = notes
            db.commit()
            db.refresh(existing)
            return existing
        else:
            completion = HabitCompletion(
                user_id=user_id,
                habit_id=habit_id,
                completed_date=completed_date,
                status=status,
                notes=notes
            )
            db.add(completion)
            db.commit()
            db.refresh(completion)
            return completion

    @staticmethod
    def delete(db: Session, user_id: str, habit_id: str, completed_date: date) -> bool:
        """
        Deletes completion record for a date (unmark habit completion).
        """
        existing = CompletionRepository.get_by_habit_and_date(db, user_id, habit_id, completed_date)
        if existing:
            db.delete(existing)
            db.commit()
            return True
        return False

    @staticmethod
    def list_for_habit(
        db: Session,
        habit_id: str,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None
    ) -> List[HabitCompletion]:
        query = db.query(HabitCompletion).filter(HabitCompletion.habit_id == habit_id)
        if start_date:
            query = query.filter(HabitCompletion.completed_date >= start_date)
        if end_date:
            query = query.filter(HabitCompletion.completed_date <= end_date)
        return query.order_by(HabitCompletion.completed_date.desc()).all()

    @staticmethod
    def list_for_user_in_range(
        db: Session,
        user_id: str,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None
    ) -> List[HabitCompletion]:
        query = db.query(HabitCompletion).filter(HabitCompletion.user_id == user_id)
        if start_date:
            query = query.filter(HabitCompletion.completed_date >= start_date)
        if end_date:
            query = query.filter(HabitCompletion.completed_date <= end_date)
        return query.order_by(HabitCompletion.completed_date.asc()).all()

    @staticmethod
    def get_recent_user_completions(
        db: Session,
        user_id: str,
        limit: int = 10
    ) -> List[HabitCompletion]:
        """
        Efficiently fetches the N most recent completion records for a user using database sorting and LIMIT.
        """
        return db.query(HabitCompletion).filter(
            HabitCompletion.user_id == user_id
        ).order_by(HabitCompletion.completed_date.desc()).limit(limit).all()

