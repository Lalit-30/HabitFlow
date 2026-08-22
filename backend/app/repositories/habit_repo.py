from typing import List, Optional
from sqlalchemy.orm import Session, joinedload
from app.models.habit import Habit, HabitSchedule
from app.schemas.habit import HabitCreateRequest, HabitUpdateRequest


class HabitRepository:
    @staticmethod
    def get_by_id_and_user(db: Session, habit_id: str, user_id: str) -> Optional[Habit]:
        """
        Fetch habit by ID scoped strictly to the authenticated user (Multi-Tenant) with eager loading.
        """
        return db.query(Habit).options(
            joinedload(Habit.category),
            joinedload(Habit.schedules)
        ).filter(Habit.id == habit_id, Habit.user_id == user_id).first()

    @staticmethod
    def list_by_user(
        db: Session,
        user_id: str,
        is_archived: Optional[bool] = False,
        category_id: Optional[str] = None
    ) -> List[Habit]:
        """
        List habits belonging to user with eager loading of categories and schedules.
        """
        query = db.query(Habit).options(
            joinedload(Habit.category),
            joinedload(Habit.schedules)
        ).filter(Habit.user_id == user_id)
        if is_archived is not None:
            query = query.filter(Habit.is_archived == is_archived)
        if category_id:
            query = query.filter(Habit.category_id == category_id)
        return query.order_by(Habit.created_at.desc()).all()

    @staticmethod
    def create(db: Session, user_id: str, request: HabitCreateRequest) -> Habit:
        """
        Creates a new Habit and associated HabitSchedule records in a single database transaction.
        """
        habit = Habit(
            user_id=user_id,
            category_id=request.category_id,
            name=request.name,
            description=request.description,
            icon=request.icon,
            color=request.color,
            frequency_type=request.frequency_type,
            target_count=request.target_count,
            target_unit=request.target_unit,
            start_date=request.start_date,
            reminder_time=request.reminder_time,
            is_archived=False
        )
        db.add(habit)
        db.flush()  # Flush to populate habit.id for schedules

        # Insert schedule days
        if request.frequency_type == "daily":
            days = list(range(7))  # 0 to 6
        else:
            days = request.days_of_week if request.days_of_week else list(range(7))

        for day in set(days):
            schedule = HabitSchedule(habit_id=habit.id, day_of_week=day)
            db.add(schedule)

        db.commit()
        db.refresh(habit)
        return habit

    @staticmethod
    def update(db: Session, habit: Habit, request: HabitUpdateRequest) -> Habit:
        """
        Updates habit attributes and replaces schedule entries if days_of_week or frequency_type updated.
        """
        update_dict = request.model_dump(exclude_unset=True, exclude={"days_of_week"})
        for key, value in update_dict.items():
            setattr(habit, key, value)

        if request.days_of_week is not None or request.frequency_type is not None:
            # Rebuild schedules
            db.query(HabitSchedule).filter(HabitSchedule.habit_id == habit.id).delete()
            freq = habit.frequency_type
            if freq == "daily":
                days = list(range(7))
            else:
                days = request.days_of_week if request.days_of_week is not None else [s.day_of_week for s in habit.schedules]

            for day in set(days):
                schedule = HabitSchedule(habit_id=habit.id, day_of_week=day)
                db.add(schedule)

        db.commit()
        db.refresh(habit)
        return habit

    @staticmethod
    def archive(db: Session, habit: Habit) -> Habit:
        """
        Soft-archives a habit.
        """
        habit.is_archived = True
        db.commit()
        db.refresh(habit)
        return habit

    @staticmethod
    def restore(db: Session, habit: Habit) -> Habit:
        """
        Restores an archived habit.
        """
        habit.is_archived = False
        db.commit()
        db.refresh(habit)
        return habit

    @staticmethod
    def delete(db: Session, habit: Habit) -> None:
        """
        Permanently deletes a habit record from the database.
        """
        db.delete(habit)
        db.commit()
