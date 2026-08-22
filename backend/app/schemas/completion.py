from typing import Optional
from datetime import date, datetime
from pydantic import BaseModel, Field, ConfigDict, field_validator


class HabitCompletionToggleRequest(BaseModel):
    completed_date: date = Field(default_factory=date.today)
    status: str = Field("completed", description="completed, skipped, failed")
    notes: Optional[str] = None

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: str) -> str:
        if v not in ("completed", "skipped", "failed"):
            raise ValueError("status must be one of: 'completed', 'skipped', 'failed'")
        return v


class HabitCompletionResponse(BaseModel):
    id: str
    habit_id: str
    user_id: str
    completed_date: date
    status: str
    notes: Optional[str] = None
    completed_at: datetime
    user_xp: Optional[int] = None
    user_level: Optional[int] = None

    model_config = ConfigDict(from_attributes=True)
