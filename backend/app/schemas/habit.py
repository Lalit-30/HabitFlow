from typing import Optional, List
from datetime import date, time, datetime
from pydantic import BaseModel, Field, ConfigDict, field_validator
from app.schemas.category import CategoryResponse


class HabitCreateRequest(BaseModel):
    category_id: str
    name: str = Field(..., min_length=2, max_length=150)
    description: Optional[str] = None
    icon: str = Field("check-circle", max_length=50)
    color: str = Field("#3B82F6", max_length=20)
    frequency_type: str = Field("daily", description="daily, weekly, custom")
    target_count: int = Field(1, ge=1)
    target_unit: Optional[str] = Field("times", max_length=30)
    start_date: date = Field(default_factory=date.today)
    reminder_time: Optional[time] = None
    days_of_week: List[int] = Field(default=[], description="List of integers 0-6 (0=Sun, 1=Mon, ..., 6=Sat)")

    @field_validator("frequency_type")
    @classmethod
    def validate_frequency(cls, v: str) -> str:
        if v not in ("daily", "weekly", "custom"):
            raise ValueError("frequency_type must be one of: 'daily', 'weekly', 'custom'")
        return v

    @field_validator("days_of_week")
    @classmethod
    def validate_days(cls, v: List[int]) -> List[int]:
        for day in v:
            if not (0 <= day <= 6):
                raise ValueError("day_of_week must be an integer between 0 and 6")
        return sorted(list(set(v)))


class HabitUpdateRequest(BaseModel):
    category_id: Optional[str] = None
    name: Optional[str] = Field(None, min_length=2, max_length=150)
    description: Optional[str] = Field(None, max_length=500)
    icon: Optional[str] = Field(None, max_length=50)
    color: Optional[str] = Field(None, max_length=20)
    frequency_type: Optional[str] = None
    target_count: Optional[int] = Field(None, ge=1)
    target_unit: Optional[str] = Field(None, max_length=30)
    start_date: Optional[date] = None
    reminder_time: Optional[time] = None
    days_of_week: Optional[List[int]] = None


class HabitScheduleResponse(BaseModel):
    id: str
    day_of_week: int

    model_config = ConfigDict(from_attributes=True)


class HabitResponse(BaseModel):
    id: str
    user_id: str
    category_id: str
    category: Optional[CategoryResponse] = None
    name: str
    description: Optional[str] = None
    icon: str
    color: str
    frequency_type: str
    target_count: int
    target_unit: Optional[str] = None
    start_date: date
    reminder_time: Optional[time] = None
    is_archived: bool
    created_at: datetime
    updated_at: datetime
    scheduled_days: List[int] = []

    model_config = ConfigDict(from_attributes=True)
