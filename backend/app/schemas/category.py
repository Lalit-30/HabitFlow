from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict


class CategoryCreateRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=50)
    icon: str = Field("folder", max_length=50)
    color: str = Field("#6B7280", max_length=20)


class CategoryResponse(BaseModel):
    id: str
    user_id: Optional[str] = None
    name: str
    icon: str
    color: str
    is_system: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
