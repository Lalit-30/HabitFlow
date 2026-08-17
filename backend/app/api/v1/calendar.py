from datetime import date, timedelta
from calendar import monthrange
from typing import Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.repositories.habit_repo import HabitRepository
from app.repositories.completion_repo import CompletionRepository
from app.services.streak_service import StreakService

router = APIRouter()


@router.get("", status_code=status.HTTP_200_OK)
def get_calendar_overview(
    year: Optional[int] = Query(None, description="Year (e.g., 2026)"),
    month: Optional[int] = Query(None, description="Month (1-12)"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get monthly grid habit completions for calendar view.
    """
    today = date.today()
    target_year = year if year else today.year
    target_month = month if month else today.month

    num_days = monthrange(target_year, target_month)[1]
    month_start = date(target_year, target_month, 1)
    month_end = date(target_year, target_month, num_days)

    habits = HabitRepository.list_by_user(db, user_id=current_user.id, is_archived=False)
    completions = CompletionRepository.list_for_user_in_range(
        db, user_id=current_user.id, start_date=month_start, end_date=month_end
    )
    completion_lookup = {(c.habit_id, c.completed_date): c for c in completions}

    days_data = []
    curr = month_start
    while curr <= month_end:
        dow = StreakService._date_to_dow(curr)
        scheduled_habits = []
        completed_count = 0
        total_scheduled = 0

        for h in habits:
            if h.start_date > curr:
                continue
            s_days = [s.day_of_week for s in h.schedules] if h.schedules else list(range(7))
            if dow in s_days:
                total_scheduled += 1
                comp = completion_lookup.get((h.id, curr))
                is_comp = comp is not None and comp.status == "completed"
                if is_comp:
                    completed_count += 1

                scheduled_habits.append({
                    "habit_id": h.id,
                    "name": h.name,
                    "icon": h.icon,
                    "color": h.color,
                    "is_completed": is_comp,
                    "notes": comp.notes if comp else None
                })

        days_data.append({
            "date": curr.isoformat(),
            "day_number": curr.day,
            "day_of_week": dow,
            "total_scheduled": total_scheduled,
            "completed_count": completed_count,
            "completion_percentage": round((completed_count / total_scheduled * 100), 1) if total_scheduled > 0 else 0.0,
            "habits": scheduled_habits
        })
        curr += timedelta(days=1)

    return {
        "year": target_year,
        "month": target_month,
        "days": days_data
    }
