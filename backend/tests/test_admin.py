from tests.conftest import TestingSessionLocal
from app.models.user import User


def get_admin_auth_headers(client, email="admin@habitflow.com"):
    # 1. Register user
    client.post("/api/v1/auth/register", json={
        "email": email,
        "password": "adminpassword123",
        "full_name": "Admin Test User"
    })

    # 2. Login
    login_res = client.post("/api/v1/auth/login", json={
        "email": email,
        "password": "adminpassword123"
    })
    token = login_res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def test_non_admin_forbidden_access(client):
    # Regular user without admin privileges
    client.post("/api/v1/auth/register", json={
        "email": "regularuser@example.com",
        "password": "userpassword123",
        "full_name": "Regular User"
    })
    token = client.post("/api/v1/auth/login", json={
        "email": "regularuser@example.com",
        "password": "userpassword123"
    }).json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    res = client.get("/api/v1/admin/users", headers=headers)
    assert res.status_code == 403


def test_admin_list_users(client):
    headers = get_admin_auth_headers(client, email="admin@habitflow.com")
    
    # Register a regular user to be listed
    client.post("/api/v1/auth/register", json={
        "email": "manageduser@example.com",
        "password": "password123",
        "full_name": "Managed User"
    })

    res = client.get("/api/v1/admin/users", headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert "users" in data
    assert len(data["users"]) >= 1


def test_admin_create_and_delete_user(client):
    headers = get_admin_auth_headers(client)

    # Admin create user
    create_res = client.post("/api/v1/admin/users", headers=headers, json={
        "email": "newuserbyadmin@example.com",
        "password": "password123",
        "full_name": "Created By Admin"
    })
    assert create_res.status_code == 201
    created_data = create_res.json()
    user_id = created_data["user_id"]

    # Admin delete user
    del_res = client.delete(f"/api/v1/admin/users/{user_id}", headers=headers)
    assert del_res.status_code == 200

