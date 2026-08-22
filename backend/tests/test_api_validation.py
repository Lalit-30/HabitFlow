import pytest


def test_register_short_password_validation_error(client):
    payload = {
        "email": "shortpass@example.com",
        "password": "123",  # Under 4 chars requirement
        "full_name": "Short Pass User"
    }
    response = client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 422
    data = response.json()
    assert "detail" in data
    assert isinstance(data["detail"], list)


def test_register_missing_required_fields(client):
    payload = {
        "email": "missingfields@example.com"
        # missing password and full_name
    }
    response = client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 422


def test_create_habit_invalid_payload(client):
    # Register & get token
    client.post("/api/v1/auth/register", json={
        "email": "invalidhabit@example.com",
        "password": "password123",
        "full_name": "Valid User"
    })
    token = client.post("/api/v1/auth/login", json={
        "email": "invalidhabit@example.com",
        "password": "password123"
    }).json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Custom frequency without specifying days_of_week should fail or handle cleanly
    response = client.post("/api/v1/habits", headers=headers, json={
        "name": "Invalid Custom Habit",
        "frequency_type": "custom"
        # missing days_of_week
    })
    assert response.status_code in (400, 422)
