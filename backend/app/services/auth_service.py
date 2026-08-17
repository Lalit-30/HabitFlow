from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.repositories.user_repo import UserRepository
from app.core.security import get_password_hash, verify_password, create_access_token
from app.schemas.auth import UserRegisterRequest, UserLoginRequest, TokenResponse, ChangePasswordRequest, ForgotPasswordRequest
from app.models.user import User


class AuthService:
    @staticmethod
    def register_user(db: Session, request: UserRegisterRequest) -> User:
        """
        Registers a new user account with email, password, and full name.
        Automatically assigns admin status if registering admin@habitflow.com.
        """
        clean_email = request.email.strip().lower()
        existing_user = UserRepository.get_by_email(db, clean_email)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A user with this email address already exists. Please sign in or use a different email."
            )
        
        hashed_pwd = get_password_hash(request.password)
        is_admin_flag = True if clean_email == "admin@habitflow.com" else False
        
        user = User(
            email=clean_email,
            hashed_password=hashed_pwd,
            full_name=request.full_name,
            is_admin=is_admin_flag,
            is_active=True
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        return user

    @staticmethod
    def login_user(db: Session, request: UserLoginRequest) -> TokenResponse:
        """
        Authenticates user credentials against database records and issues a signed JWT access token.
        """
        clean_email = request.email.strip().lower()
        user = UserRepository.get_by_email(db, clean_email)

        if not user or not verify_password(request.password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Failed to sign in. Please check your credentials.",
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
    def change_user_password(db: Session, user: User, request: ChangePasswordRequest) -> dict:
        """
        Verifies current password and sets a new password for the user account.
        """
        if not verify_password(request.current_password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Current password entered is incorrect."
            )
        
        user.hashed_password = get_password_hash(request.new_password)
        db.commit()
        return {"message": "Password successfully reset and updated."}

    @staticmethod
    def reset_password_by_email(db: Session, request: ForgotPasswordRequest) -> dict:
        """
        Resets user password via email verification.
        """
        clean_email = request.email.strip().lower()
        user = UserRepository.get_by_email(db, clean_email)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No account registered with this email address."
            )

        user.hashed_password = get_password_hash(request.new_password)
        user.is_active = True
        db.commit()

        return {"message": "Password successfully reset! You can now log in with your new password."}

    @staticmethod
    def update_user_profile(db: Session, user: User, request) -> User:
        """
        Updates user profile attributes.
        """
        update_data = request.model_dump(exclude_unset=True)
        updated_user = UserRepository.update_profile(db, user=user, update_data=update_data)
        return updated_user
