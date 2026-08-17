from datetime import date, timedelta


def get_auth_headers(client, email="streakuser@example.com"):
    client.post("/api/v1/auth/register", json={
        "email": email,
        "password": "password123",
        "full_name": "Streak User"
    })
    login_res = client.post("/api/v1/auth/login", json={
        "email": email,
        "password": "password123"
    })
    token = login_res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def test_streak_consecutive_days(client):
    headers = get_auth_headers(client, email="streak1@example.com")
    cat_id = client.get("/api/v1/categories", headers=headers).json()[0]["id"]
    today = date.today()
    start_date = today - timedelta(days=4)

    # Create daily habit started 4 days ago
    habit = client.post("/api/v1/habits", headers=headers, json={
        "category_id": cat_id,
        "name": "Daily Exercise",
        "frequency_type": "daily",
        "start_date": start_date.isoformat()
    }).json()
    habit_id = habit["id"]

    # Mark 5 days completed (start_date up to today)
    for i in range(5):
        d = start_date + timedelta(days=i)
        client.post(f"/api/v1/habits/{habit_id}/complete", headers=headers, json={
            "completed_date": d.isoformat(),
            "status": "completed"
        })

    stats = client.get(f"/api/v1/habits/{habit_id}/statistics", headers=headers).json()
    assert stats["current_streak"] == 5
    assert stats["longest_streak"] == 5
    assert stats["completion_percentage"] == 100.0


def test_streak_missed_day_resets_current_streak(client):
    headers = get_auth_headers(client, email="streak2@example.com")
    cat_id = client.get("/api/v1/categories", headers=headers).json()[0]["id"]
    today = date.today()
    start_date = today - timedelta(days=5)

    habit = client.post("/api/v1/habits", headers=headers, json={
        "category_id": cat_id,
        "name": "Meditation",
        "frequency_type": "daily",
        "start_date": start_date.isoformat()
    }).json()
    habit_id = habit["id"]

    # Complete days 0, 1, 2 (streak 3), miss day 3, complete days 4, 5 (streak 2)
    completed_indices = [0, 1, 2, 4, 5]
    for idx in completed_indices:
        d = start_date + timedelta(days=idx)
        client.post(f"/api/v1/habits/{habit_id}/complete", headers=headers, json={
            "completed_date": d.isoformat(),
            "status": "completed"
        })

    stats = client.get(f"/api/v1/habits/{habit_id}/statistics", headers=headers).json()
    assert stats["current_streak"] == 2
    assert stats["longest_streak"] == 3


def test_streak_custom_weekly_days_skips_off_days(client):
    headers = get_auth_headers(client, email="streak3@example.com")
    cat_id = client.get("/api/v1/categories", headers=headers).json()[0]["id"]
    today = date.today()

    # Schedule habit for specific days of week: Mon, Wed, Fri
    habit = client.post("/api/v1/habits", headers=headers, json={
        "category_id": cat_id,
        "name": "SQL Practice",
        "frequency_type": "custom",
        "days_of_week": [1, 3, 5],
        "start_date": (today - timedelta(days=14)).isoformat()
    }).json()
    habit_id = habit["id"]

    stats = client.get(f"/api/v1/habits/{habit_id}/statistics", headers=headers).json()
    assert "current_streak" in stats
    assert "longest_streak" in stats
