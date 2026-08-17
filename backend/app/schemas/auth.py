from typing import Optional
from datetime import datetime, date
from pydantic import BaseModel, Field, ConfigDict


class UserRegisterRequest(BaseModel):
    email: str = Field(..., min_length=3, description="Email address or username")
    password: str = Field(..., min_length=4, description="Password must be at least 4 characters")
    full_name: str = Field(..., min_length=1, max_length=100)


class UserLoginRequest(BaseModel):
    email: str
    password: str


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=4, description="New password must be at least 4 characters")


class ForgotPasswordRequest(BaseModel):
    email: str
    new_password: str = Field(..., min_length=4, description="New password must be at least 4 characters")


class UserProfileUpdateRequest(BaseModel):
    full_name: Optional[str] = Field(None, min_length=1, max_length=100)
    avatar_url: Optional[str] = None
    age: Optional[int] = Field(None, ge=1, le=120)
    dob: Optional[date] = None
    gender: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None
    height: Optional[float] = Field(None, ge=30.0, le=300.0)
    weight: Optional[float] = Field(None, ge=10.0, le=500.0)
    health_goal: Optional[str] = None


class AdminUserCreateRequest(BaseModel):
    email: str = Field(..., min_length=3)
    password: str = Field(..., min_length=4)
    full_name: str = Field(..., min_length=1)
    is_admin: bool = False
    height: Optional[float] = None
    weight: Optional[float] = None
    health_goal: Optional[str] = None


class AdminUserUpdateRequest(BaseModel):
    full_name: Optional[str] = None
    email: Optional[str] = None
    level: Optional[int] = Field(None, ge=1)
    xp: Optional[int] = Field(None, ge=0)
    is_active: Optional[bool] = None
    city: Optional[str] = None
    country: Optional[str] = None
    height: Optional[float] = None
    weight: Optional[float] = None
    health_goal: Optional[str] = None


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserResponse(BaseModel):
    id: str
    user_code: Optional[str] = "#100000"
    email: str
    full_name: str
    xp: Optional[int] = 0
    level: Optional[int] = 1
    is_active: Optional[bool] = True
    is_admin: Optional[bool] = False
    avatar_url: Optional[str] = None
    age: Optional[int] = None
    dob: Optional[date] = None
    gender: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None
    height: Optional[float] = None
    weight: Optional[float] = None
    health_goal: Optional[str] = None
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
