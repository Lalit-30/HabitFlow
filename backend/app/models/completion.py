import uuid
from datetime import datetime, date, timezone
from sqlalchemy import Column, String, Text, Date, DateTime, ForeignKey, UniqueConstraint, Index
from sqlalchemy.orm import relationship
from app.models.base import Base


class HabitCompletion(Base):
    __tablename__ = "habit_completions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    habit_id = Column(String(36), ForeignKey("habits.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    completed_date = Column(Date, nullable=False, index=True)
    status = Column(String(20), nullable=False, default="completed")  # completed, skipped, failed
    notes = Column(Text, nullable=True)
    completed_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    __table_args__ = (
        UniqueConstraint("user_id", "habit_id", "completed_date", name="uq_user_habit_completion_date"),
        Index("ix_habit_completions_user_date", "user_id", "completed_date"),
        Index("ix_habit_completions_habit_date", "habit_id", "completed_date"),
    )

    # Relationships
    habit = relationship("Habit", backref="completions")
    user = relationship("User", backref="completions")

    def __repr__(self):
        return f"<HabitCompletion(habit_id={self.habit_id}, date={self.completed_date}, status={self.status})>"
