from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_admin_user
from app.models.user import User
from app.models.habit import Habit
from app.models.completion import HabitCompletion
from app.schemas.auth import UserResponse, AdminUserCreateRequest, AdminUserUpdateRequest
from app.repositories.user_repo import UserRepository
from app.core.security import get_password_hash

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/users", status_code=status.HTTP_200_OK)
def get_all_users_for_admin(
    admin_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """
    Admin Endpoint: Fetch all registered users (excluding admin@habitflow.com).
    Returns real-time user profiles with associated habit counts and activity data.
    """
    users = db.query(User).filter(
        User.email != "admin@habitflow.com",
        User.is_admin == False
    ).order_by(User.created_at.desc()).all()

    result = []
    for u in users:
        habits_count = db.query(Habit).filter(Habit.user_id == u.id).count()
        completions_count = db.query(HabitCompletion).filter(HabitCompletion.user_id == u.id).count()
        
        result.append({
            "id": u.id,
            "user_code": u.user_code or f"#{u.id[:6]}",
            "email": u.email,
            "full_name": u.full_name,
            "xp": u.xp,
            "level": u.level,
            "is_active": u.is_active,
            "is_admin": u.is_admin,
            "avatar_url": u.avatar_url,
            "age": u.age,
            "gender": u.gender,
            "city": u.city,
            "country": u.country,
            "height": u.height,
            "weight": u.weight,
            "health_goal": u.health_goal,
            "created_at": u.created_at.isoformat() if u.created_at else None,
            "habits_count": habits_count,
            "completions_count": completions_count
        })

    return {"users": result, "total": len(result)}


@router.post("/users", status_code=status.HTTP_201_CREATED)
def create_user_by_admin(
    req: AdminUserCreateRequest,
    admin_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """
    Admin Endpoint: Create a new user account directly from Admin Panel.
    """
    existing = UserRepository.get_by_email(db, req.email)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email address already exists."
        )

    new_user = User(
        email=req.email,
        hashed_password=get_password_hash(req.password),
        full_name=req.full_name,
        is_admin=req.is_admin,
        height=req.height,
        weight=req.weight,
        health_goal=req.health_goal
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"message": "User created successfully", "user_id": new_user.id}


@router.put("/users/{user_id}", status_code=status.HTTP_200_OK)
def update_user_by_admin(
    user_id: str,
    req: AdminUserUpdateRequest,
    admin_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """
    Admin Endpoint: Modify any user's profile details, Level, XP, or physical stats.
    """
    target = UserRepository.get_by_id(db, user_id)
    if not target:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with ID '{user_id}' not found."
        )

    if req.full_name is not None:
        target.full_name = req.full_name
    if req.email is not None:
        target.email = req.email
    if req.level is not None:
        target.level = req.level
    if req.xp is not None:
        target.xp = req.xp
    if req.is_active is not None:
        target.is_active = req.is_active
    if req.city is not None:
        target.city = req.city
    if req.country is not None:
        target.country = req.country
    if req.height is not None:
        target.height = req.height
    if req.weight is not None:
        target.weight = req.weight
    if req.health_goal is not None:
        target.health_goal = req.health_goal

    db.commit()
    db.refresh(target)
    return {"message": f"User '{target.full_name}' updated successfully."}


@router.delete("/users/{user_id}", status_code=status.HTTP_200_OK)
def delete_user_by_admin(
    user_id: str,
    admin_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """
    Admin Endpoint: Delete any user account by ID.
    """
    target = UserRepository.get_by_id(db, user_id)
    if not target:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with ID '{user_id}' not found."
        )

    UserRepository.delete_user(db, target)
    return {"message": f"User account '{user_id}' successfully deleted by admin."}
