import pytest


def get_auth_token(client, email="habituser@example.com"):
    client.post("/api/v1/auth/register", json={
        "email": email,
        "password": "password123",
        "full_name": "Habit User"
    })
    res = client.post("/api/v1/auth/login", json={
        "email": email,
        "password": "password123"
    })
    return res.json()["access_token"]


def test_list_categories(client):
    token = get_auth_token(client)
    headers = {"Authorization": f"Bearer {token}"}
    res = client.get("/api/v1/categories", headers=headers)
    assert res.status_code == 200
    categories = res.json()
    assert len(categories) >= 7
    system_names = [c["name"] for c in categories if c["is_system"]]
    assert "Health" in system_names
    assert "Fitness" in system_names


def test_create_custom_category(client):
    token = get_auth_token(client, email="customcat@example.com")
    headers = {"Authorization": f"Bearer {token}"}
    res = client.post("/api/v1/categories", headers=headers, json={
        "name": "Guitar Practice",
        "icon": "music",
        "color": "#EC4899"
    })
    assert res.status_code == 201
    data = res.json()
    assert data["name"] == "Guitar Practice"
    assert data["is_system"] is False


def test_create_habit_daily(client):
    token = get_auth_token(client, email="dailyhabit@example.com")
    headers = {"Authorization": f"Bearer {token}"}

    # Get category ID
    cats = client.get("/api/v1/categories", headers=headers).json()
    cat_id = cats[0]["id"]

    habit_payload = {
        "category_id": cat_id,
        "name": "Read 20 pages",
        "description": "Read non-fiction book daily",
        "icon": "book-open",
        "color": "#3B82F6",
        "frequency_type": "daily",
        "target_count": 20,
        "target_unit": "pages"
    }
    res = client.post("/api/v1/habits", headers=headers, json=habit_payload)
    assert res.status_code == 201
    data = res.json()
    assert data["name"] == "Read 20 pages"
    assert data["scheduled_days"] == [0, 1, 2, 3, 4, 5, 6]


def test_create_habit_custom_days(client):
    token = get_auth_token(client, email="customhabit@example.com")
    headers = {"Authorization": f"Bearer {token}"}

    cats = client.get("/api/v1/categories", headers=headers).json()
    cat_id = cats[0]["id"]

    habit_payload = {
        "category_id": cat_id,
        "name": "Gym Workout",
        "frequency_type": "custom",
        "days_of_week": [1, 3, 5]  # Mon, Wed, Fri
    }
    res = client.post("/api/v1/habits", headers=headers, json=habit_payload)
    assert res.status_code == 201
    data = res.json()
    assert data["scheduled_days"] == [1, 3, 5]


def test_habit_multi_tenant_isolation(client):
    # User A creates a habit
    token_a = get_auth_token(client, email="usera@example.com")
    headers_a = {"Authorization": f"Bearer {token_a}"}
    cat_id_a = client.get("/api/v1/categories", headers=headers_a).json()[0]["id"]

    habit_a = client.post("/api/v1/habits", headers=headers_a, json={
        "category_id": cat_id_a,
        "name": "User A Private Habit"
    }).json()
    habit_id = habit_a["id"]

    # User B tries to view User A's habit
    token_b = get_auth_token(client, email="userb@example.com")
    headers_b = {"Authorization": f"Bearer {token_b}"}

    res_view = client.get(f"/api/v1/habits/{habit_id}", headers=headers_b)
    assert res_view.status_code == 404

    res_delete = client.delete(f"/api/v1/habits/{habit_id}", headers=headers_b)
    assert res_delete.status_code == 404


def test_archive_and_restore_habit(client):
    token = get_auth_token(client, email="archiveuser@example.com")
    headers = {"Authorization": f"Bearer {token}"}
    cat_id = client.get("/api/v1/categories", headers=headers).json()[0]["id"]

    habit = client.post("/api/v1/habits", headers=headers, json={
        "category_id": cat_id,
        "name": "Temp Habit"
    }).json()
    habit_id = habit["id"]

    # Archive
    archive_res = client.patch(f"/api/v1/habits/{habit_id}/archive", headers=headers)
    assert archive_res.status_code == 200
    assert archive_res.json()["is_archived"] is True

    # Restore
    restore_res = client.patch(f"/api/v1/habits/{habit_id}/restore", headers=headers)
    assert restore_res.status_code == 200
    assert restore_res.json()["is_archived"] is False
