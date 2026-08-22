from datetime import date, timedelta
from typing import Dict, Any, List, Set
from collections import defaultdict
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

        # 1. Get active unarchived habits for user
        all_habits = HabitRepository.list_by_user(db, user_id=user_id, is_archived=False)

        # 2. Batch load ALL completions for user in 1 single SQL query
        all_completions = CompletionRepository.list_for_user_in_range(db, user_id=user_id)
        completions_by_habit: Dict[str, Set[date]] = defaultdict(set)
        completion_lookup: Set[tuple] = set()

        for c in all_completions:
            if c.status == "completed":
                completions_by_habit[c.habit_id].add(c.completed_date)
                completion_lookup.add((c.habit_id, c.completed_date))

        today_habits = []
        completed_today_count = 0
        total_scheduled_today = 0
        current_max_streak = 0
        best_ever_streak = 0

        for h in all_habits:
            scheduled_days = [s.day_of_week for s in h.schedules] if h.schedules else list(range(7))
            completed_dates = completions_by_habit[h.id]
            stats = StreakService.calculate_habit_stats_from_dates(habit=h, completed_dates=completed_dates, target_date=target_date)

            if stats["current_streak"] > current_max_streak:
                current_max_streak = stats["current_streak"]
            if stats["longest_streak"] > best_ever_streak:
                best_ever_streak = stats["longest_streak"]

            is_scheduled_today = dow in scheduled_days
            is_completed_today = (h.id, target_date) in completion_lookup

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

        # 3. 7-Day Week Consistency Matrix (calculated in-memory)
        recent_week_days = []
        for i in range(6, -1, -1):
            day_date = target_date - timedelta(days=i)
            day_dow = StreakService._date_to_dow(day_date)
            day_tot_sched = 0
            day_comp_count = 0

            for h in all_habits:
                if h.start_date > day_date:
                    continue
                s_days = [s.day_of_week for s in h.schedules] if h.schedules else list(range(7))
                if day_dow in s_days:
                    day_tot_sched += 1
                    if (h.id, day_date) in completion_lookup:
                        day_comp_count += 1

            day_rate = round((day_comp_count / day_tot_sched * 100), 1) if day_tot_sched > 0 else 0.0
            recent_week_days.append({
                "date": day_date.isoformat(),
                "day_number": day_date.day,
                "day_of_week": day_dow,
                "total_scheduled": day_tot_sched,
                "completed_count": day_comp_count,
                "completion_percentage": day_rate
            })

        # 4. Recent activity (last 10 completions using DB sorting & LIMIT 10)
        recent_completions = CompletionRepository.get_recent_user_completions(db, user_id=user_id, limit=10)
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
            "recent_week_days": recent_week_days,
            "recent_activity": recent_activity
        }
