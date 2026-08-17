from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.models.category import Category


SYSTEM_CATEGORIES = [
    {"name": "Health", "icon": "heart", "color": "#EF4444"},
    {"name": "Fitness", "icon": "dumbbell", "color": "#F97316"},
    {"name": "Learning", "icon": "book-open", "color": "#3B82F6"},
    {"name": "Productivity", "icon": "zap", "color": "#EAB308"},
    {"name": "Finance", "icon": "dollar-sign", "color": "#10B981"},
    {"name": "Personal", "icon": "user", "color": "#8B5CF6"},
    {"name": "Work", "icon": "briefcase", "color": "#6366F1"},
]


class CategoryRepository:
    @staticmethod
    def seed_system_categories(db: Session) -> None:
        """
        Seeds default system categories if they do not exist.
        """
        for cat_data in SYSTEM_CATEGORIES:
            existing = db.query(Category).filter(
                Category.is_system == True,
                Category.name == cat_data["name"]
            ).first()
            if not existing:
                category = Category(
                    name=cat_data["name"],
                    icon=cat_data["icon"],
                    color=cat_data["color"],
                    is_system=True
                )
                db.add(category)
        db.commit()

    @staticmethod
    def get_by_id(db: Session, category_id: str) -> Optional[Category]:
        """
        Fetch category by Primary Key ID.
        """
        return db.query(Category).filter(Category.id == category_id).first()

    @staticmethod
    def list_all_for_user(db: Session, user_id: str) -> List[Category]:
        """
        List all available categories for a user (System + Custom).
        """
        CategoryRepository.seed_system_categories(db)
        return db.query(Category).filter(
            or_(Category.is_system == True, Category.user_id == user_id)
        ).order_by(Category.is_system.desc(), Category.name.asc()).all()

    @staticmethod
    def create_custom(db: Session, user_id: str, name: str, icon: str, color: str) -> Category:
        """
        Create a custom user category.
        """
        category = Category(
            user_id=user_id,
            name=name,
            icon=icon,
            color=color,
            is_system=False
        )
        db.add(category)
        db.commit()
        db.refresh(category)
        return category
