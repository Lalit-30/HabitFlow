from datetime import date, timedelta
from typing import List, Dict, Any, Set
from sqlalchemy.orm import Session
from app.models.habit import Habit
from app.repositories.completion_repo import CompletionRepository


class StreakService:
    @staticmethod
    def _date_to_dow(d: date) -> int:
        """
        Converts Python date to 0=Sunday, 1=Monday, ..., 6=Saturday.
        Python weekday(): 0=Mon, 1=Tue, ..., 6=Sun.
        """
        return (d.weekday() + 1) % 7

    @staticmethod
    def calculate_habit_stats(db: Session, habit: Habit, target_date: date = None) -> Dict[str, Any]:
        """
        Calculates current streak, longest streak, total completions, and completion rate
        for a habit handling daily, weekly, and custom schedule days.
        """
        if target_date is None:
            target_date = date.today()

        scheduled_days: Set[int] = {s.day_of_week for s in habit.schedules} if habit.schedules else set(range(7))
        if not scheduled_days:
            scheduled_days = set(range(7))

        completions = CompletionRepository.list_for_habit(db, habit_id=habit.id)
        completed_dates: Set[date] = {c.completed_date for c in completions if c.status == "completed"}

        # -------------------------------------------------------------
        # 1. Current Streak Calculation (backwards from target_date)
        # -------------------------------------------------------------
        current_streak = 0
        curr = target_date

        while curr >= habit.start_date:
            dow = StreakService._date_to_dow(curr)
            if dow in scheduled_days:
                if curr in completed_dates:
                    current_streak += 1
                else:
                    if curr == target_date:
                        # If today is scheduled but not completed yet, keep checking yesterday
                        pass
                    else:
                        # Missed past scheduled day -> streak broken
                        break
            curr -= timedelta(days=1)

        # -------------------------------------------------------------
        # 2. Longest Streak Calculation (forward from start_date)
        # -------------------------------------------------------------
        longest_streak = 0
        temp_streak = 0
        total_scheduled = 0
        total_completed = 0

        scan_date = habit.start_date
        while scan_date <= target_date:
            dow = StreakService._date_to_dow(scan_date)
            if dow in scheduled_days:
                total_scheduled += 1
                if scan_date in completed_dates:
                    total_completed += 1
                    temp_streak += 1
                    if temp_streak > longest_streak:
                        longest_streak = temp_streak
                else:
                    temp_streak = 0
            scan_date += timedelta(days=1)

        completion_rate = round((total_completed / total_scheduled * 100), 1) if total_scheduled > 0 else 0.0

        return {
            "habit_id": habit.id,
            "current_streak": current_streak,
            "longest_streak": longest_streak,
            "total_completions": len(completed_dates),
            "total_scheduled_days": total_scheduled,
            "completion_percentage": completion_rate
        }
