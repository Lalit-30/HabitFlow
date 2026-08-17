from datetime import date
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from app.repositories.habit_repo import HabitRepository
from app.repositories.completion_repo import CompletionRepository
from app.services.streak_service import StreakService
from app.services.habit_service import HabitService


class DashboardService:
    @staticmethod
    def get_dashboard_summary(db: Session, user_id: str, target_date: date = None) -> Dict[str, Any]:
        if target_date is None:
            target_date = date.today()

        dow = StreakService._date_to_dow(target_date)

        # Get active unarchived habits for user
        all_habits = HabitRepository.list_by_user(db, user_id=user_id, is_archived=False)

        today_habits = []
        completed_today_count = 0
        total_scheduled_today = 0
        current_max_streak = 0
        best_ever_streak = 0

        # Get completions for today
        completions_today = CompletionRepository.list_for_user_in_range(
            db, user_id=user_id, start_date=target_date, end_date=target_date
        )
        completed_habit_ids = {c.habit_id for c in completions_today if c.status == "completed"}

        for h in all_habits:
            scheduled_days = [s.day_of_week for s in h.schedules] if h.schedules else list(range(7))
            stats = StreakService.calculate_habit_stats(db, habit=h, target_date=target_date)

            if stats["current_streak"] > current_max_streak:
                current_max_streak = stats["current_streak"]
            if stats["longest_streak"] > best_ever_streak:
                best_ever_streak = stats["longest_streak"]

            is_scheduled_today = dow in scheduled_days
            is_completed_today = h.id in completed_habit_ids

            if is_scheduled_today:
                total_scheduled_today += 1
                if is_completed_today:
                    completed_today_count += 1

                habit_data = HabitService.to_habit_response(h).model_dump()
                habit_data["is_completed_today"] = is_completed_today
                habit_data["current_streak"] = stats["current_streak"]
                habit_data["longest_streak"] = stats["longest_streak"]
                today_habits.append(habit_data)

        completion_pct = round((completed_today_count / total_scheduled_today * 100), 1) if total_scheduled_today > 0 else 0.0

        # Recent activity (last 10 completions)
        recent_completions = CompletionRepository.list_for_user_in_range(db, user_id=user_id)[-10:]
        recent_activity = []
        for c in recent_completions:
            recent_activity.append({
                "completion_id": c.id,
                "habit_id": c.habit_id,
                "habit_name": c.habit.name if c.habit else "Habit",
                "completed_date": c.completed_date.isoformat(),
                "status": c.status,
                "notes": c.notes
            })

        return {
            "date": target_date.isoformat(),
            "total_scheduled_today": total_scheduled_today,
            "completed_today": completed_today_count,
            "completion_percentage": completion_pct,
            "current_max_streak": current_max_streak,
            "best_ever_streak": best_ever_streak,
            "today_habits": today_habits,
            "recent_activity": list(reversed(recent_activity))
        }
