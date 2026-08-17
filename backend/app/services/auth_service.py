from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.repositories.user_repo import UserRepository
from app.core.security import get_password_hash, verify_password, create_access_token
from app.schemas.auth import UserRegisterRequest, UserLoginRequest, TokenResponse
from app.models.user import User


class AuthService:
    @staticmethod
    def register_user(db: Session, request: UserRegisterRequest) -> User:
        """
        Registers a new user account.
        Raises HTTP 400 Bad Request if the email is already registered.
        """
        existing_user = UserRepository.get_by_email(db, request.email)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A user with this email address already exists."
            )
        
        hashed_pwd = get_password_hash(request.password)
        user = UserRepository.create(
            db=db,
            email=request.email,
            hashed_password=hashed_pwd,
            full_name=request.full_name
        )
        return user

    @staticmethod
    def login_user(db: Session, request: UserLoginRequest) -> TokenResponse:
        """
        Authenticates user credentials and issues a signed JWT access token.
        Raises HTTP 401 Unauthorized for invalid credentials.
        """
        user = UserRepository.get_by_email(db, request.email)
        if not user or not verify_password(request.password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email address or password.",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User account is deactivated."
            )

        token = create_access_token(subject=user.id)
        return TokenResponse(access_token=token, token_type="bearer")

    @staticmethod
    def update_user_profile(db: Session, user: User, request) -> User:
        """
        Updates user profile attributes (name, avatar, age, dob, gender, city, country, height, weight, health_goal).
        """
        update_data = request.model_dump(exclude_unset=True)
        updated_user = UserRepository.update_profile(db, user=user, update_data=update_data)
        return updated_user
