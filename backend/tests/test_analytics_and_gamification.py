import pytest


def get_auth_headers(client, email="analyticsuser@example.com"):
    client.post("/api/v1/auth/register", json={
        "email": email,
        "password": "password123",
        "full_name": "Analytics User"
    })
    login_res = client.post("/api/v1/auth/login", json={
        "email": email,
        "password": "password123"
    })
    token = login_res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def test_dashboard_endpoint(client):
    headers = get_auth_headers(client, email="dash1@example.com")
    res = client.get("/api/v1/dashboard", headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert "total_scheduled_today" in data
    assert "completion_percentage" in data
    assert "current_max_streak" in data


def test_calendar_endpoint(client):
    headers = get_auth_headers(client, email="cal1@example.com")
    res = client.get("/api/v1/calendar?year=2026&month=8", headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert data["year"] == 2026
    assert data["month"] == 8
    assert len(data["days"]) == 31


def test_analytics_endpoint(client):
    headers = get_auth_headers(client, email="ana1@example.com")
    res = client.get("/api/v1/analytics?range=7d", headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert data["range"] == "7d"
    assert len(data["completion_trend"]) == 7
    assert "best_performing" in data


def test_achievements_endpoint(client):
    headers = get_auth_headers(client, email="ach1@example.com")
    res = client.get("/api/v1/achievements", headers=headers)
    assert res.status_code == 200
    achievements = res.json()
    assert len(achievements) >= 5
    codes = [a["code"] for a in achievements]
    assert "FIRST_HABIT" in codes
    assert "STREAK_7" in codes
