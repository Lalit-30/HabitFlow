from typing import Optional, Dict, Any
from sqlalchemy.orm import Session
from app.models.user import User


class UserRepository:
    @staticmethod
    def get_by_id(db: Session, user_id: str) -> Optional[User]:
        """
        Fetch user by unique Primary Key UUID.
        """
        return db.query(User).filter(User.id == user_id).first()

    @staticmethod
    def get_by_email(db: Session, email: str) -> Optional[User]:
        """
        Fetch user by unique Email address (case-insensitive search).
        """
        return db.query(User).filter(User.email == email.lower()).first()

    @staticmethod
    def create(db: Session, email: str, hashed_password: str, full_name: str) -> User:
        """
        Creates and persists a new User record in the database.
        """
        user = User(
            email=email.lower().strip(),
            hashed_password=hashed_password,
            full_name=full_name.strip()
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        return user

    @staticmethod
    def update_profile(db: Session, user: User, update_data: Dict[str, Any]) -> User:
        """
        Updates profile fields for a user.
        """
        for key, value in update_data.items():
            if value is not None:
                setattr(user, key, value)
        db.commit()
        db.refresh(user)
        return user
