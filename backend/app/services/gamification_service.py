from typing import List, Dict, Any
from sqlalchemy.orm import Session
from app.models.achievement import Achievement, UserAchievement
from app.models.user import User
from app.repositories.habit_repo import HabitRepository
from app.repositories.completion_repo import CompletionRepository
from app.services.streak_service import StreakService


SYSTEM_ACHIEVEMENTS = [
    {
        "code": "FIRST_HABIT",
        "title": "First Step",
        "description": "Created your very first habit",
        "badge_icon": "target",
        "xp_reward": 50
    },
    {
        "code": "FIRST_COMPLETION",
        "title": "Action Taker",
        "description": "Completed your first habit log",
        "badge_icon": "check-circle-2",
        "xp_reward": 50
    },
    {
        "code": "STREAK_7",
        "title": "7-Day Warrior",
        "description": "Maintained a 7-day streak on any habit",
        "badge_icon": "flame",
        "xp_reward": 100
    },
    {
        "code": "STREAK_30",
        "title": "Monthly Master",
        "description": "Achieved a 30-day streak on any habit",
        "badge_icon": "trophy",
        "xp_reward": 250
    },
    {
        "code": "CENTURION",
        "title": "Centurion",
        "description": "Completed 100 total habit logs",
        "badge_icon": "zap",
        "xp_reward": 500
    }
]


class GamificationService:
    @staticmethod
    def seed_achievements(db: Session) -> None:
        for ach in SYSTEM_ACHIEVEMENTS:
            existing = db.query(Achievement).filter(Achievement.code == ach["code"]).first()
            if not existing:
                item = Achievement(
                    code=ach["code"],
                    title=ach["title"],
                    description=ach["description"],
                    badge_icon=ach["badge_icon"],
                    xp_reward=ach["xp_reward"]
                )
                db.add(item)
        db.commit()

    @staticmethod
    def check_and_unlock_achievements(db: Session, user: User) -> List[str]:
        GamificationService.seed_achievements(db)
        unlocked_codes = []

        unlocked_ids = {
            ua.achievement_id for ua in db.query(UserAchievement).filter(UserAchievement.user_id == user.id).all()
        }

        achievements_map = {a.code: a for a in db.query(Achievement).all()}

        habits = HabitRepository.list_by_user(db, user_id=user.id)
        completions = CompletionRepository.list_for_user_in_range(db, user_id=user.id)

        # 1. FIRST_HABIT
        if len(habits) >= 1 and "FIRST_HABIT" in achievements_map:
            ach = achievements_map["FIRST_HABIT"]
            if ach.id not in unlocked_ids:
                db.add(UserAchievement(user_id=user.id, achievement_id=ach.id))
                user.xp += ach.xp_reward
                unlocked_codes.append(ach.code)

        # 2. FIRST_COMPLETION
        completed_logs = [c for c in completions if c.status == "completed"]
        if len(completed_logs) >= 1 and "FIRST_COMPLETION" in achievements_map:
            ach = achievements_map["FIRST_COMPLETION"]
            if ach.id not in unlocked_ids:
                db.add(UserAchievement(user_id=user.id, achievement_id=ach.id))
                user.xp += ach.xp_reward
                unlocked_codes.append(ach.code)

        # 3. CENTURION
        if len(completed_logs) >= 100 and "CENTURION" in achievements_map:
            ach = achievements_map["CENTURION"]
            if ach.id not in unlocked_ids:
                db.add(UserAchievement(user_id=user.id, achievement_id=ach.id))
                user.xp += ach.xp_reward
                unlocked_codes.append(ach.code)

        # 4 & 5. STREAKS
        max_streak = 0
        for h in habits:
            stats = StreakService.calculate_habit_stats(db, habit=h)
            if stats["current_streak"] > max_streak:
                max_streak = stats["current_streak"]
            if stats["longest_streak"] > max_streak:
                max_streak = stats["longest_streak"]

        if max_streak >= 7 and "STREAK_7" in achievements_map:
            ach = achievements_map["STREAK_7"]
            if ach.id not in unlocked_ids:
                db.add(UserAchievement(user_id=user.id, achievement_id=ach.id))
                user.xp += ach.xp_reward
                unlocked_codes.append(ach.code)

        if max_streak >= 30 and "STREAK_30" in achievements_map:
            ach = achievements_map["STREAK_30"]
            if ach.id not in unlocked_ids:
                db.add(UserAchievement(user_id=user.id, achievement_id=ach.id))
                user.xp += ach.xp_reward
                unlocked_codes.append(ach.code)

        if unlocked_codes:
            user.level = int((user.xp / 50) ** 0.5) + 1
            db.commit()

        return unlocked_codes

    @staticmethod
    def get_user_achievements(db: Session, user: User) -> List[Dict[str, Any]]:
        GamificationService.seed_achievements(db)
        GamificationService.check_and_unlock_achievements(db, user)

        all_achievements = db.query(Achievement).all()
        user_unlocked = {
            ua.achievement_id: ua.unlocked_at
            for ua in db.query(UserAchievement).filter(UserAchievement.user_id == user.id).all()
        }

        result = []
        for ach in all_achievements:
            is_unlocked = ach.id in user_unlocked
            result.append({
                "id": ach.id,
                "code": ach.code,
                "title": ach.title,
                "description": ach.description,
                "badge_icon": ach.badge_icon,
                "xp_reward": ach.xp_reward,
                "is_unlocked": is_unlocked,
                "unlocked_at": user_unlocked[ach.id].isoformat() if is_unlocked else None
            })
        return result
