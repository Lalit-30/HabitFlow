import uuid
from datetime import datetime, timezone, date
from sqlalchemy import Column, String, Integer, Float, Boolean, Date, DateTime
from app.models.base import Base


class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(100), nullable=False)
    xp = Column(Integer, default=0, nullable=False)
    level = Column(Integer, default=1, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    
    # Extended Profile & Health Tracking attributes
    avatar_url = Column(String(500), nullable=True)
    age = Column(Integer, nullable=True)
    dob = Column(Date, nullable=True)
    gender = Column(String(30), nullable=True)
    city = Column(String(100), nullable=True)
    country = Column(String(100), nullable=True)
    height = Column(Float, nullable=True)  # in cm
    weight = Column(Float, nullable=True)  # in kg
    health_goal = Column(String(255), nullable=True)

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    @property
    def user_code(self) -> str:
        """
        Generates a unique 6-digit formatted code derived deterministically from the user ID.
        """
        numeric_hash = abs(hash(self.id)) % 900000 + 100000
        return f"#{numeric_hash}"

    def __repr__(self):
        return f"<User(id={self.id}, email={self.email}, user_code={self.user_code})>"
