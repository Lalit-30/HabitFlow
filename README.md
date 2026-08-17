# 🔥 HabitFlow — Modern Full-Stack Habit Tracker

[![Python 3.12](https://img.shields.io/badge/Python-3.12-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688.svg)](https://fastapi.tiangolo.com/)
[![React 18](https://img.shields.io/badge/Frontend-React%2018%20%2B%20TS-61DAFB.svg)](https://reactjs.org/)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-336791.svg)](https://www.postgresql.org/)
[![Docker Compose](https://img.shields.io/badge/Containerization-Docker Compose-2496ED.svg)](https://www.docker.com/)

A modern, production-ready, full-stack Habit Tracker web application designed for high consistency, streak calculation, interactive calendar heatmaps, and analytics.

---

## 🚀 Key Features

* **🔐 User Authentication & Multi-Tenancy**:
  * Secure user registration & sign-in with bcrypt password hashing.
  * JWT Bearer Token stateless authentication.
  * Multi-tenant data isolation: every habit, completion log, category, and statistic is strictly scoped to the authenticated user.

* **🎯 Habit Management & Custom Schedules**:
  * Flexible frequency support: **Everyday**, **Weekly**, or **Custom Days** (e.g. Mon, Wed, Fri).
  * Habit attributes: Categories, targets (e.g., 20 pages, 2 liters), color accents, soft archiving & restoration.

* **⚡ Idempotent Completion Engine**:
  * Daily habit completion logging with status (`completed`, `skipped`, `failed`) and notes.
  * Database-level unique constraint (`user_id, habit_id, completed_date`) prevents duplicate completion records.

* **🔥 Algorithmic Streak Engine**:
  * Smart calculation of **Current Streak** and **Longest Streak**.
  * Off-schedule days (e.g., Tuesday for a Mon/Wed/Fri habit) DO NOT break active streaks.

* **📊 Dashboard & Interactive Analytics**:
  * Daily summary overview with animated progress indicators.
  * Recharts weekly completion bar charts and category distribution donut charts.
  * Leaderboard of top-performing and worst-performing habits.

* **📅 Calendar View**:
  * Monthly heat grid showing completion rates per day.
  * Clickable date inspection showing scheduled habits and completion notes.

* **🏆 Gamification**:
  * XP points engine (+10 XP per completion) with dynamic leveling: `Level = floor(sqrt(XP / 50)) + 1`.
  * Achievements and unlockable badges (e.g., "First Step", "7-Day Warrior", "Centurion").

---

## 🏗️ Architecture & Technology Stack

```text
                               +-----------------------------------------+
                               |             Browser Client              |
                               |  React 18 + TypeScript + Tailwind CSS   |
                               +--------------------|--------------------+
                                                    | HTTP REST (JSON)
                                                    | Bearer JWT
                                                    v
                               +-----------------------------------------+
                               |            FastAPI Gateway              |
                               |      CORS / Auth Middleware / OpenAPI   |
                               +--------------------|--------------------+
                                                    |
                                +-------------------+-------------------+
                                |                                       |
                                v                                       v
               +---------------------------------+     +----------------------------------+
               |         Service Layer           |     |         Security Engine          |
               | Habit / Streak / Analytics Logics|    |   Password Hash / JWT Validator  |
               +----------------|----------------+     +----------------------------------+
                                |
                                v
               +---------------------------------+
               |        Repository Layer         |
               |  SQLAlchemy ORM + Data Mapping |
               +----------------|----------------+
                                |
                                v
               +---------------------------------+
               |       PostgreSQL Database       |
               | Relational Schema + Constraints |
               +---------------------------------+
```

### Stack Components

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, TypeScript, Tailwind CSS, Recharts, Lucide Icons, Vite, Axios |
| **Backend** | Python 3.12, FastAPI, Pydantic v2, SQLAlchemy 2.0 ORM, Alembic |
| **Database** | PostgreSQL 15 (SQLite local development fallback) |
| **Security** | Passlib (bcrypt salting), PyJWT (HS256) |
| **Testing** | Pytest, TestClient, Httpx |
| **DevOps** | Docker, Docker Compose, Nginx |

---

## 📊 Database Schema (ASCII ER Diagram)

```text
  +-------------------+              +----------------------+
  |       USERS       |              |      CATEGORIES      |
  +-------------------+              +----------------------+
  | PK  id            |<----+        | PK  id               |
  |     email         |     |        | FK  user_id (opt)    |
  |     hashed_pass   |     |        |     name             |
  |     full_name     |     |        |     icon / color     |
  |     xp / level    |     |        +----------+-----------+
  +---------+---------+     |                   |
            |               |                   | 1
            | 1             |                   |
            |               |                   v N
            |               |        +----------------------+
            |               |        |        HABITS        |
            |               |        +----------------------+
            |               |        | PK  id               |
            |               +--------| FK  user_id          |
            |                        | FK  category_id      |
            |                        |     name             |
            |                        |     frequency_type   |
            |                        |     target_count     |
            |                        |     is_archived      |
            |                        +----+-------------+---+
            |                             |             |
            | 1                           | 1           | 1
            |                             |             |
            v N                           v N           v N
  +-------------------+        +-------------------+  +--------------------+
  | HABIT_COMPLETIONS |        |  HABIT_SCHEDULES  |  |  USER_ACHIEVEMENTS |
  +-------------------+        +-------------------+  +--------------------+
  | PK  id            |        | FK  habit_id      |  | FK  user_id        |
  | FK  user_id       |        |     day_of_week   |  | FK  achievement_id |
  | FK  habit_id      |        +-------------------+  +--------------------+
  |     completed_date|
  +-------------------+
    * UNIQUE(user_id, habit_id, completed_date)
```

---

## ⚡ Quick Start Guide

### Option 1: Docker Compose (Recommended)

Run the complete multi-container application with a single command:

```bash
docker-compose up --build
```

Access the application in your browser:
* **Frontend Web App**: `http://localhost`
* **FastAPI Backend API**: `http://localhost:8000`
* **Interactive OpenAPI Docs**: `http://localhost:8000/docs`

---

### Option 2: Local Development Setup

#### 1. Backend Setup

```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv

# Activate virtualenv (Windows PowerShell)
.\venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt

# Run FastAPI backend server
python -m uvicorn app.main:app --reload --app-dir backend
```

Backend will start at `http://127.0.0.1:8000`.

#### 2. Frontend Setup

```bash
# Navigate to frontend in another terminal
cd frontend

# Install npm dependencies
npm install

# Start Vite dev server
npm run dev
```

Frontend will start at `http://localhost:5173`.

---

## 🧪 Automated Testing

Execute the backend test suite:

```bash
.\backend\venv\Scripts\python -m pytest backend/tests
```

```text
============================= test session starts =============================
platform win32 -- Python 3.12.2, pytest-8.4.2
collected 25 items

backend\tests\test_analytics_and_gamification.py ....                    [ 16%]
backend\tests\test_auth.py ......                                        [ 40%]
backend\tests\test_completions.py ...                                    [ 52%]
backend\tests\test_habits.py ......                                      [ 76%]
backend\tests\test_main.py ...                                           [ 88%]
backend\tests\test_streaks.py ...                                        [100%]

============================= 25 passed in 14.64s =============================
```

---

## 💼 Resume Bullet Points

* **Full-Stack Architecture**: Architected a production-ready habit tracking platform using React 18, TypeScript, Tailwind CSS, FastAPI, and PostgreSQL with clean layered architecture (Router, Service, Repository).
* **Multi-Tenant Security**: Designed stateless JWT authentication and strict DB-level multi-tenant user scoping, ensuring complete data isolation across endpoints.
* **Algorithmic Business Logic**: Engineered a custom streak calculation engine that handles non-daily schedules (custom days of week) without penalizing off-days.
* **Idempotency & Data Integrity**: Implemented database-level unique constraints on completion logs preventing race conditions and duplicate completion entries.
* **DevOps & Containerization**: Containerized multi-tier services using Docker Compose, orchestrating PostgreSQL, FastAPI backend, and Nginx serving React SPA.
