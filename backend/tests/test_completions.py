from datetime import date


def get_auth_headers_and_habit(client, email="compuser@example.com"):
    client.post("/api/v1/auth/register", json={
        "email": email,
        "password": "password123",
        "full_name": "Comp User"
    })
    login_res = client.post("/api/v1/auth/login", json={
        "email": email,
        "password": "password123"
    })
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    cat_id = client.get("/api/v1/categories", headers=headers).json()[0]["id"]
    habit_res = client.post("/api/v1/habits", headers=headers, json={
        "category_id": cat_id,
        "name": "Drink Water",
        "target_count": 2,
        "target_unit": "Liters"
    })
    habit_id = habit_res.json()["id"]
    return headers, habit_id


def test_mark_habit_completed(client):
    headers, habit_id = get_auth_headers_and_habit(client, email="comp1@example.com")
    today_str = date.today().isoformat()

    res = client.post(f"/api/v1/habits/{habit_id}/complete", headers=headers, json={
        "completed_date": today_str,
        "status": "completed",
        "notes": "Drank 2.5L"
    })
    assert res.status_code == 200
    data = res.json()
    assert data["habit_id"] == habit_id
    assert data["completed_date"] == today_str
    assert data["status"] == "completed"

    # Verify XP increased to 10
    me_res = client.get("/api/v1/auth/me", headers=headers)
    assert me_res.json()["xp"] == 10


def test_duplicate_completion_idempotent(client):
    headers, habit_id = get_auth_headers_and_habit(client, email="comp2@example.com")
    today_str = date.today().isoformat()

    # Complete 1st time
    client.post(f"/api/v1/habits/{habit_id}/complete", headers=headers, json={
        "completed_date": today_str,
        "status": "completed"
    })

    # Complete 2nd time with different note
    res2 = client.post(f"/api/v1/habits/{habit_id}/complete", headers=headers, json={
        "completed_date": today_str,
        "status": "completed",
        "notes": "Updated note"
    })
    assert res2.status_code == 200
    assert res2.json()["notes"] == "Updated note"

    # Verify only 1 record returned in history
    history = client.get(f"/api/v1/habits/{habit_id}/completions", headers=headers).json()
    assert len(history) == 1


def test_unmark_completion(client):
    headers, habit_id = get_auth_headers_and_habit(client, email="comp3@example.com")
    today_str = date.today().isoformat()

    # Complete
    client.post(f"/api/v1/habits/{habit_id}/complete", headers=headers, json={
        "completed_date": today_str
    })

    # Delete completion
    del_res = client.delete(f"/api/v1/habits/{habit_id}/complete/{today_str}", headers=headers)
    assert del_res.status_code == 200

    # History should now be empty
    history = client.get(f"/api/v1/habits/{habit_id}/completions", headers=headers).json()
    assert len(history) == 0
