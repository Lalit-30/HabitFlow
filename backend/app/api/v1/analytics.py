from datetime import date, timedelta
from typing import Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.repositories.habit_repo import HabitRepository
from app.repositories.category_repo import CategoryRepository
from app.repositories.completion_repo import CompletionRepository
from app.services.streak_service import StreakService

router = APIRouter()

DAYS_MAP = {"7d": 7, "30d": 30, "3m": 90, "1y": 365}
DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]


@router.get("", status_code=status.HTTP_200_OK)
def get_analytics_report(
    time_range: str = Query("7d", alias="range", description="7d, 30d, 3m, 1y"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get detailed habit performance analytics and trend charts data over a time range.
    Formated X-axis date/month for monthly, quarterly, and yearly ranges.
    """
    num_days = DAYS_MAP.get(time_range, 7)
    today = date.today()
    start_date = today - timedelta(days=num_days - 1)

    habits = HabitRepository.list_by_user(db, user_id=current_user.id, is_archived=False)
    completions = CompletionRepository.list_for_user_in_range(
        db, user_id=current_user.id, start_date=start_date, end_date=today
    )
    completion_lookup = {(c.habit_id, c.completed_date): c for c in completions}

    # Build in-memory completion set and habit-category mapping to eliminate N+1 SQL queries
    completions_by_habit = {}
    habit_category_map = {h.id: h.category_id for h in habits}
    for h in habits:
        completions_by_habit[h.id] = set()

    for c in completions:
        if c.status == "completed":
            if c.habit_id in completions_by_habit:
                completions_by_habit[c.habit_id].add(c.completed_date)

    # 1. Day by day trend with dynamic x-axis label formatting
    trend_data = []
    curr = start_date
    while curr <= today:
        dow = StreakService._date_to_dow(curr)
        tot_sched = 0
        tot_comp = 0
        for h in habits:
            if h.start_date > curr:
                continue
            s_days = [s.day_of_week for s in h.schedules] if h.schedules else list(range(7))
            if dow in s_days:
                tot_sched += 1
                comp = completion_lookup.get((h.id, curr))
                if comp and comp.status == "completed":
                    tot_comp += 1

        rate = round((tot_comp / tot_sched * 100), 1) if tot_sched > 0 else 0.0

        if time_range == "7d":
            label = DAY_NAMES[dow]
        else:
            label = curr.strftime("%d %b")

        trend_data.append({
            "date": curr.isoformat(),
            "day": label,
            "completed": tot_comp,
            "scheduled": tot_sched,
            "rate": rate
        })
        curr += timedelta(days=1)

    # 2. Category Breakdown (using preloaded habit_category_map)
    categories = CategoryRepository.list_all_for_user(db, user_id=current_user.id)
    cat_map = {c.id: c for c in categories}
    cat_counts = {}
    for c in completions:
        if c.status == "completed":
            cat_id = habit_category_map.get(c.habit_id)
            if cat_id:
                cat_counts[cat_id] = cat_counts.get(cat_id, 0) + 1

    tot_all_comp = sum(cat_counts.values())
    category_breakdown = []
    for cat_id, count in cat_counts.items():
        cat = cat_map.get(cat_id)
        if cat:
            category_breakdown.append({
                "category_id": cat.id,
                "name": cat.name,
                "color": cat.color,
                "icon": cat.icon,
                "count": count,
                "percentage": round((count / tot_all_comp * 100), 1) if tot_all_comp > 0 else 0.0
            })

    # 3. Habit performance leaderboard (using in-memory streak calculation)
    habit_performances = []
    for h in habits:
        completed_dates = completions_by_habit.get(h.id, set())
        stats = StreakService.calculate_habit_stats_from_dates(habit=h, completed_dates=completed_dates)
        habit_performances.append({
            "id": h.id,
            "name": h.name,
            "icon": h.icon,
            "color": h.color,
            "current_streak": stats["current_streak"],
            "longest_streak": stats["longest_streak"],
            "total_completions": stats["total_completions"],
            "completion_percentage": stats["completion_percentage"]
        })

    sorted_best = sorted(habit_performances, key=lambda x: (x["completion_percentage"], x["current_streak"]), reverse=True)
    sorted_worst = sorted(habit_performances, key=lambda x: (x["completion_percentage"], x["current_streak"]))

    return {
        "range": time_range,
        "completion_trend": trend_data,
        "category_breakdown": category_breakdown,
        "best_performing": sorted_best[:5],
        "worst_performing": sorted_worst[:5]
    }
