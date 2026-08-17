import uuid
from datetime import datetime, date, time, timezone
from sqlalchemy import Column, String, Text, Integer, Boolean, Date, Time, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from app.models.base import Base


class Habit(Base):
    __tablename__ = "habits"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    category_id = Column(String(36), ForeignKey("categories.id", ondelete="RESTRICT"), nullable=False, index=True)
    name = Column(String(150), nullable=False)
    description = Column(Text, nullable=True)
    icon = Column(String(50), nullable=False, default="check-circle")
    color = Column(String(20), nullable=False, default="#3B82F6")
    frequency_type = Column(String(20), nullable=False, default="daily")  # daily, weekly, custom
    target_count = Column(Integer, nullable=False, default=1)
    target_unit = Column(String(30), nullable=True, default="times")
    start_date = Column(Date, nullable=False, default=date.today)
    reminder_time = Column(Time, nullable=True)
    is_archived = Column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    user = relationship("User", backref="habits")
    category = relationship("Category", backref="habits")
    schedules = relationship("HabitSchedule", back_populates="habit", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Habit(id={self.id}, name={self.name}, frequency={self.frequency_type})>"


class HabitSchedule(Base):
    __tablename__ = "habit_schedules"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    habit_id = Column(String(36), ForeignKey("habits.id", ondelete="CASCADE"), nullable=False, index=True)
    day_of_week = Column(Integer, nullable=False)  # 0=Sunday, 1=Monday, ..., 6=Saturday

    __table_args__ = (
        UniqueConstraint("habit_id", "day_of_week", name="uq_habit_schedule_day"),
    )

    habit = relationship("Habit", back_populates="schedules")

    def __repr__(self):
        return f"<HabitSchedule(habit_id={self.habit_id}, day={self.day_of_week})>"
