import pytest


def test_register_user_success(client):
    payload = {
        "email": "testuser@example.com",
        "password": "securepassword123",
        "full_name": "Test User"
    }
    response = client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "testuser@example.com"
    assert data["full_name"] == "Test User"
    assert data["xp"] == 0
    assert data["level"] == 1
    assert "id" in data


def test_register_user_duplicate_email(client):
    payload = {
        "email": "duplicate@example.com",
        "password": "password123",
        "full_name": "User One"
    }
    # Register first time
    response1 = client.post("/api/v1/auth/register", json=payload)
    assert response1.status_code == 201

    # Register second time with same email
    response2 = client.post("/api/v1/auth/register", json=payload)
    assert response2.status_code == 400
    assert "already exists" in response2.json()["detail"]


def test_login_user_success(client):
    # 1. Register user
    reg_payload = {
        "email": "loginuser@example.com",
        "password": "mypassword123",
        "full_name": "Login User"
    }
    client.post("/api/v1/auth/register", json=reg_payload)

    # 2. Login
    login_payload = {
        "email": "loginuser@example.com",
        "password": "mypassword123"
    }
    response = client.post("/api/v1/auth/login", json=login_payload)
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


def test_login_user_invalid_password(client):
    reg_payload = {
        "email": "wrongpassuser@example.com",
        "password": "mypassword123",
        "full_name": "Login User"
    }
    client.post("/api/v1/auth/register", json=reg_payload)

    login_payload = {
        "email": "wrongpassuser@example.com",
        "password": "wrongpassword"
    }
    response = client.post("/api/v1/auth/login", json=login_payload)
    assert response.status_code == 401


def test_get_current_user_profile_success(client):
    # 1. Register
    email = "profileuser@example.com"
    client.post("/api/v1/auth/register", json={
        "email": email,
        "password": "profilepass123",
        "full_name": "Profile User"
    })

    # 2. Login & retrieve token
    login_res = client.post("/api/v1/auth/login", json={
        "email": email,
        "password": "profilepass123"
    })
    token = login_res.json()["access_token"]

    # 3. Access protected route
    headers = {"Authorization": f"Bearer {token}"}
    response = client.get("/api/v1/auth/me", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == email
    assert data["full_name"] == "Profile User"


def test_get_current_user_profile_unauthorized(client):
    # Missing token header
    res1 = client.get("/api/v1/auth/me")
    assert res1.status_code in (401, 403)

    # Invalid token
    headers = {"Authorization": "Bearer invalid_token_12345"}
    res2 = client.get("/api/v1/auth/me", headers=headers)
    assert res2.status_code == 401
