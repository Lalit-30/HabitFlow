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


def test_update_user_profile(client):
    # 1. Register & login
    email = "updateprof@example.com"
    client.post("/api/v1/auth/register", json={
        "email": email,
        "password": "password123",
        "full_name": "Before Update"
    })
    token = client.post("/api/v1/auth/login", json={
        "email": email,
        "password": "password123"
    }).json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Update profile parameters
    update_res = client.put("/api/v1/auth/profile", headers=headers, json={
        "full_name": "After Update",
        "height": 180.5,
        "weight": 75.0,
        "health_goal": "Run 5K daily"
    })
    assert update_res.status_code == 200
    data = update_res.json()
    assert data["full_name"] == "After Update"
    assert data["height"] == 180.5
    assert data["weight"] == 75.0
    assert data["health_goal"] == "Run 5K daily"


def test_change_password_workflow(client):
    email = "changepwd@example.com"
    client.post("/api/v1/auth/register", json={
        "email": email,
        "password": "oldpassword123",
        "full_name": "Change Pwd User"
    })
    token = client.post("/api/v1/auth/login", json={
        "email": email,
        "password": "oldpassword123"
    }).json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Incorrect current password should fail
    fail_res = client.post("/api/v1/auth/change-password", headers=headers, json={
        "current_password": "wrongoldpassword",
        "new_password": "newpassword123"
    })
    assert fail_res.status_code == 400

    # Correct current password should succeed
    success_res = client.post("/api/v1/auth/change-password", headers=headers, json={
        "current_password": "oldpassword123",
        "new_password": "newpassword123"
    })
    assert success_res.status_code == 200

    # Login with new password
    new_login = client.post("/api/v1/auth/login", json={
        "email": email,
        "password": "newpassword123"
    })
    assert new_login.status_code == 200


def test_forgot_password_reset(client):
    email = "forgotuser@example.com"
    client.post("/api/v1/auth/register", json={
        "email": email,
        "password": "initialpassword",
        "full_name": "Forgot User"
    })

    reset_res = client.post("/api/v1/auth/forgot-password", json={
        "email": email,
        "new_password": "resetpassword123"
    })
    assert reset_res.status_code == 200

    # Login with reset password
    login_res = client.post("/api/v1/auth/login", json={
        "email": email,
        "password": "resetpassword123"
    })
    assert login_res.status_code == 200

