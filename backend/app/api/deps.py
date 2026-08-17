from typing import Generator
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import decode_access_token
from app.repositories.user_repo import UserRepository
from app.models.user import User

# Standard HTTP Bearer scheme for Swagger UI & API header authorization
security = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    """
    FastAPI dependency that validates Bearer JWT token from Authorization header.
    Re-hydrates authenticated User model across cold serverless containers if missing.
    """
    token = credentials.credentials
    payload = decode_access_token(token)
    
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate authentication credentials or token has expired.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user_id: str = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token payload.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user = UserRepository.get_by_id(db, user_id=user_id)

    # Re-hydrate user in this container's DB if cold-started on a different Vercel Lambda
    if user is None:
        email = payload.get("email") or "user@habitflow.com"
        is_admin_flag = payload.get("is_admin", False)
        if email == "admin@habitflow.com":
            is_admin_flag = True
        full_name = payload.get("full_name") or email.split('@')[0].capitalize()

        user = User(
            id=user_id,
            email=email,
            hashed_password="[AUTHENTICATED_VIA_JWT]",
            full_name=full_name,
            is_admin=is_admin_flag,
            is_active=True
        )
        db.add(user)
        try:
            db.commit()
            db.refresh(user)
        except Exception:
            db.rollback()
            user = UserRepository.get_by_id(db, user_id=user_id) or UserRepository.get_by_email(db, email)
            if user is None:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="User associated with token could not be verified.",
                    headers={"WWW-Authenticate": "Bearer"},
                )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is deactivated."
        )
    
    return user


def get_admin_user(current_user: User = Depends(get_current_user)) -> User:
    """
    FastAPI dependency enforcing Admin permissions.
    Restricts access strictly to admin@habitflow.com or accounts with is_admin=True.
    """
    if not (current_user.is_admin or current_user.email == "admin@habitflow.com"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access restricted strictly to admin account (admin@habitflow.com)."
        )
    return current_user
