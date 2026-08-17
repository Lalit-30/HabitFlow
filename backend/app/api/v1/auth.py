from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.auth import UserRegisterRequest, UserLoginRequest, UserProfileUpdateRequest, ChangePasswordRequest, TokenResponse, UserResponse
from app.services.auth_service import AuthService
from app.api.deps import get_current_user
from app.models.user import User

router = APIRouter()


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register_user(
    request: UserRegisterRequest,
    db: Session = Depends(get_db)
):
    """
    Register a new user account with email, password, and full name.
    """
    user = AuthService.register_user(db=db, request=request)
    return user


@router.post("/login", response_model=TokenResponse, status_code=status.HTTP_200_OK)
def login_user(
    request: UserLoginRequest,
    db: Session = Depends(get_db)
):
    """
    Authenticate user credentials and receive a JWT Bearer access token.
    """
    token_response = AuthService.login_user(db=db, request=request)
    return token_response


@router.get("/me", response_model=UserResponse, status_code=status.HTTP_200_OK)
def get_current_user_profile(
    current_user: User = Depends(get_current_user)
):
    """
    Protected endpoint: Fetch the authenticated user's profile, health tracking stats, and level/XP info.
    """
    return current_user


@router.put("/profile", response_model=UserResponse, status_code=status.HTTP_200_OK)
def update_profile(
    request: UserProfileUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Protected endpoint: Update profile picture, physical attributes (height, weight, age, dob, gender, location), and health goals.
    """
    return AuthService.update_user_profile(db=db, user=current_user, request=request)


@router.post("/change-password", status_code=status.HTTP_200_OK)
def change_password(
    request: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Protected endpoint: Change or reset account password.
    """
    return AuthService.change_user_password(db=db, user=current_user, request=request)
