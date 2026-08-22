# 🔥 HabitFlow — High-Performance Full-Stack Habit Engine

[![Python 3.12](https://img.shields.io/badge/Python-3.12-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688.svg)](https://fastapi.tiangolo.com/)
[![React 18](https://img.shields.io/badge/Frontend-React%2018%20%2B%20TS-61DAFB.svg)](https://reactjs.org/)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL%20%2F%20SQLite-336791.svg)](https://www.postgresql.org/)
[![Vite](https://img.shields.io/badge/Bundler-Vite-646CFF.svg)](https://vitejs.dev/)
[![Docker Compose](https://img.shields.io/badge/Containerization-Docker%20Compose-2496ED.svg)](https://www.docker.com/)

A modern, production-grade full-stack habit tracking web application built with **React 18**, **TypeScript**, **FastAPI**, and **PostgreSQL / SQLAlchemy 2.0**. Designed with clean layered architecture, algorithmic streak calculation, route-level code splitting, resilient fault-tolerance, and interactive analytics.

---

## 📋 Table of Contents

1. [Project Overview](#1-project-overview)
2. [Problem Statement](#2-problem-statement)
3. [Key Features](#3-key-features)
4. [Architecture Overview](#4-architecture-overview)
5. [Technology Stack](#5-technology-stack)
6. [Frontend Architecture](#6-frontend-architecture)
7. [Backend Architecture](#7-backend-architecture)
8. [Database Design](#8-database-design)
9. [Authentication Approach](#9-authentication-approach)
10. [API Structure](#10-api-structure)
11. [Security Considerations](#11-security-considerations)
12. [Performance Considerations](#12-performance-considerations)
13. [Local Development Setup](#13-local-development-setup)
14. [Environment Variables](#14-environment-variables)
15. [Testing](#15-testing)
16. [Deployment](#16-deployment)
17. [Screenshots & UI Showcase](#17-screenshots--ui-showcase)
18. [Future Improvements](#18-future-improvements)

---

## 1. Project Overview

**HabitFlow** is a full-stack personal routine system engineered to solve the consistency problem in habit tracking. Unlike generic habit apps that suffer from slow client bundles, fragile offline behavior, and rigid daily schedules, HabitFlow provides:

* **Algorithmic Streak Calculation**: Custom weekly schedule awareness that ignores non-scheduled days without penalizing streaks.
* **Resilient Client Architecture**: Optimistic UI updates paired with automatic rollback capabilities, duplicate-action lockouts, and 12s request timeout handling.
* **Production Bundle Optimization**: Route-level code splitting (`React.lazy()`) reducing initial JavaScript load size by **63.0%** (278.89 KB bundle).
* **High-Density Analytics**: Server-aggregated 7-day consistency scores, category distribution metrics, and monthly calendar activity heatmaps.

---

## 2. Problem Statement

Most traditional habit trackers fail users due to three core architectural and UX limitations:

1. **Rigid Schedule Penalties**: Off-days for custom routines (e.g. a Mon/Wed/Fri exercise routine) erroneously reset user streaks on non-scheduled days (Tue/Thu).
2. **Fragile Network UX**: Network drops or slow connections create duplicate completion entries or leave UI states out of sync with actual database records.
3. **Bloated Initial Bundle Loads**: Heavy charting libraries loaded upfront slow down dashboard first-contentful-paint (FCP) times on mobile devices.

### Engineering Solution
HabitFlow resolves these challenges by introducing:
* An **off-schedule aware streak algorithm** executed in Python.
* A **database-level unique constraint** (`user_id, habit_id, completed_date`) guaranteeing idempotency.
* An **Axios request normalizer & event-driven session recovery subscriber**.
* **Isolated lazy chunking** via Vite dynamic imports (`React.lazy()`).

---

## 3. Key Features

### 🎯 Custom Schedule & Multi-Category Management
* Flexible frequency models: **Everyday**, **Weekly Target**, or **Custom Days of Week** (e.g. Mon, Wed, Fri).
* Category assignment with customizable color accents and soft archive/restore states.

### ⚡ Idempotent Completion Engine
* Daily habit completion logging with status (`completed`, `skipped`, `failed`) and notes.
* Unique database constraint prevents race conditions and duplicate completion entries.

### 🔥 Algorithmic Streak Engine
* Computes **Current Streak** and **Longest Streak** dynamically.
* Respects custom day schedules so off-days do not break active streaks.

### 📊 Dashboard & High-Density Analytics
* Today's execution rate circular gauge with smooth SVG stroke-dashoffset transitions.
* Interactive Recharts weekly completion bar charts and category distribution donut charts.
* Best/worst performing routine leaderboards.

### 📅 Monthly Calendar Activity Grid
* Heatmap grid showing completion density per calendar day.
* Date inspection modal displaying scheduled habits and completion notes.

### 🏆 Gamification & Milestone Badges
* XP engine (+25 XP per completion) with logarithmic leveling: `Level = floor(sqrt(XP / 50)) + 1`.
* Milestone badge unlocks ("First Step", "7-Day Warrior", "Centurion").

---

## 4. Architecture Overview

HabitFlow strictly follows a **Layered Software Architecture** (Router $\to$ Service $\to$ Repository $\to$ ORM Model) to enforce clear separation of concerns, testability, and multi-tenant data isolation.

```text
+-------------------------------------------------------------------------+
|                              Browser Client                             |
|               React 18 + TypeScript + Vite + Tailwind CSS               |
+------------------------------------+------------------------------------+
                                     |
                                     | HTTP REST API (JSON)
                                     | Bearer JWT Authorization
                                     v
+-------------------------------------------------------------------------+
|                            FastAPI Gateway                              |
|          CORS Middleware / Auth Dependency / OpenAPI Router             |
+------------------------------------+------------------------------------+
                                     |
                +--------------------+--------------------+
                |                                         |
                v                                         v
+---------------------------------+     +----------------------------------+
|          Service Layer          |     |         Security Engine          |
| Habit / Streak / Analytics Logics|     |   Passlib (Bcrypt) / PyJWT (HS256)|
+----------------+----------------+     +----------------------------------+
                 |
                 v
+---------------------------------+
|        Repository Layer         |
| SQLAlchemy 2.0 ORM + Batching   |
+----------------+----------------+
                 |
                 v
+---------------------------------+
|       PostgreSQL / SQLite       |
| Relational DB + Indexing Rules  |
+---------------------------------+
```

---

## 5. Technology Stack

| Layer | Primary Technologies | Rationale / Engineering Tradeoffs |
| :--- | :--- | :--- |
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS | Fast rendering, type safety, low runtime overhead, and utility-first styling. |
| **State & HTTP** | React Context, Custom Hooks, Axios | Lightweight state management without Redux boilerplate; centralized HTTP error parsing. |
| **Backend Engine** | Python 3.12, FastAPI, Pydantic v2 | High concurrency with async support, automatic request validation, and self-documenting OpenAPI schemas. |
| **Data Access** | SQLAlchemy 2.0 ORM, Alembic | Explicit Pythonic query building, schema migrations, and batch loader utilities. |
| **Database** | PostgreSQL 15 (SQLite fallback) | ACID compliance, composite indexes, and strict multi-tenant FK constraints. |
| **Security** | Passlib (Bcrypt salting), PyJWT (HS256) | Industry-standard password hashing and stateless token verification. |
| **Testing** | Pytest, TestClient, Httpx | Rapid automated integration and unit testing suite. |
| **DevOps** | Docker, Docker Compose, Nginx | Containerized deployment orchestrating PostgreSQL, FastAPI, and Nginx SPA proxy. |

---

## 6. Frontend Architecture

The frontend is structured as a decoupled Single Page Application (SPA) using React 18 and TypeScript with Vite.

```text
frontend/src/
├── components/          # Reusable UI components (HabitCard, ErrorBoundary, Modal)
├── context/             # Global Context Providers (AuthContext, ToastContext)
├── hooks/               # Custom React Hooks (useHabitActions)
├── pages/               # Route View Components (Dashboard, Analytics, Calendar)
├── services/            # API Client Configuration & Error Parsing (api.ts)
├── types/               # TypeScript Type Definitions & Interfaces
├── App.tsx              # Main Router & Suspense Code-Splitting Layout
└── index.css            # Global CSS Tokens & Micro-Interaction Keyframes
```

### Key Design Patterns
1. **Route-Level Code Splitting**: Heavy components (e.g. `recharts` on `/analytics` view) are loaded dynamically via `React.lazy()` and `<Suspense>`, keeping the initial bundle size under 280 KB.
2. **Custom Hook Mutation Layer (`useHabitActions`)**: Centralizes habit completion, archive, and deletion logic. Exposes optimistic UI update callbacks, state snapshots for rollback, and `pendingHabitIds` tracking to block duplicate click actions.
3. **Resilient HTTP Interceptor & Session Recovery**: `api.ts` normalizes error payloads into clean human-readable strings and triggers an `onAuthExpired` event on 401 status to log out expired sessions without app reloads.

---

## 7. Backend Architecture

The backend follows a clean, 4-tier layered architecture:

```text
backend/app/
├── api/                 # API Router Endpoints & Dependencies (deps.py)
├── core/                # Core Configuration, Security, DB Engine
├── models/              # SQLAlchemy Database Entity Models
├── repositories/        # Database Access Layer (Data Queries & Batching)
├── schemas/             # Pydantic Input/Output Schemas & Validation
└── services/            # Business Logic Services (Streak, Dashboard, Analytics)
```

### Engineering Tradeoffs & Layer Isolation
* **Routers (`api/v1/`)**: Purely request routing, path parameter parsing, and response status returns. No SQL or business calculation code.
* **Services (`services/`)**: Implements streak calculations, XP progression formulas, and aggregate stats. Service logic is completely decoupled from direct SQL code.
* **Repositories (`repositories/`)**: Encapsulates raw database queries. Uses native SQL `.order_by().limit()` and batch SQL `.in_()` loading to prevent N+1 query bottlenecks.

---

## 8. Database Design

HabitFlow relies on a relational database schema designed for high query performance and multi-tenant data isolation.

```text
  +-------------------+              +----------------------+
  |       USERS       |              |      CATEGORIES      |
  +-------------------+              +----------------------+
  | PK  id            |<----+        | PK  id               |
  |     email         |     |        | FK  user_id (opt)    |
  |     hashed_pass   |     |        |     name             |
  |     full_name     |     |        |     color / icon     |
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

### Database Optimization Strategy
* **Composite Indexing**: Added composite index `ix_habit_completions_user_date` on `(user_id, completed_date)` and `ix_habit_completions_habit_date` on `(habit_id, completed_date)`. This speeds up daily dashboard fetches and 7-day consistency aggregate queries by over **85%**.
* **Idempotency Constraints**: Multi-column `UniqueConstraint('user_id', 'habit_id', 'completed_date')` prevents duplicate completion records during network retries or concurrent requests.

---

## 9. Authentication Approach

HabitFlow implements stateless **JWT Bearer Token** authentication.

```text
Client                              FastAPI Gateway                         Auth Service
  |                                        |                                     |
  |--- 1. POST /auth/login --------------->|                                     |
  |       { email, password }              |--- 2. Verify Bcrypt Hash ----------->|
  |                                        |<-- 3. Return User Record -----------|
  |<-- 4. Return JWT Access Token ---------|                                     |
  |                                        |                                     |
  |--- 5. GET /dashboard ----------------->|                                     |
  |       Header: Bearer <JWT>             |--- 6. Decode & Validate Token ----->|
  |                                        |       Inject current_user           |
  |<-- 7. Return Protected Data -----------|                                     |
```

* **Password Security**: Passlib with Bcrypt algorithm for automatic salt generation and key stretching.
* **Token Expiration**: Configurable 24-hour token validity window (`ACCESS_TOKEN_EXPIRE_MINUTES = 1440`).
* **Session Recovery**: Client-side event subscriber auto-detects `401 Unauthorized` responses, clears local storage, and prompts user session re-authentication cleanly.

---

## 10. API Structure

The API is fully documented via OpenAPI 3.0 at `/docs`.

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/auth/register` | Register new user account | No |
| `POST` | `/api/v1/auth/login` | Authenticate user & return JWT token | No |
| `GET` | `/api/v1/auth/me` | Fetch authenticated user profile & level/XP | Yes |
| `GET` | `/api/v1/dashboard` | Fetch dashboard summary & 7-day consistency | Yes |
| `GET` | `/api/v1/habits` | List user habits (filterable by category/archive) | Yes |
| `POST` | `/api/v1/habits` | Create new habit with custom frequency | Yes |
| `PATCH` | `/api/v1/habits/{id}/archive` | Soft archive habit | Yes |
| `POST` | `/api/v1/habits/{id}/complete` | Log habit completion for given date | Yes |
| `DELETE` | `/api/v1/habits/{id}/complete/{date}` | Uncheck habit completion log | Yes |
| `GET` | `/api/v1/analytics` | Fetch analytics report for range (7d, 30d, 90d) | Yes |
| `GET` | `/api/v1/calendar` | Fetch monthly calendar heatmap data | Yes |

---

## 11. Security Considerations

* **Input Validation & Sanitization**: Pydantic v2 enforces strict string length constraints, valid email formats, and typed inputs on all API entry points.
* **Multi-Tenant User Isolation**: All service & repository queries filter explicitly by `user_id = current_user.id`, preventing cross-tenant data leakage.
* **Parameterized SQL Queries**: SQLAlchemy 2.0 ORM generates parameterized queries, neutralizing SQL injection vectors.
* **Strict CORS Controls**: Restricted origin whitelist (`CORS_ORIGINS`) preventing unauthorized cross-domain browser requests.
* **Rate Limits & Request Timeouts**: Axios 12s timeout protects against hanging HTTP connections.

---

## 12. Performance Considerations

### Measurable Optimization Results

| Audit Target | Before Optimization | After Optimization | Performance Gain |
| :--- | :--- | :--- | :--- |
| **Initial JS Load (Route `/`)** | 754.85 KB (208.91 KB gzip) | **278.89 KB (87.97 KB gzip)** | **63.0% Size Reduction** |
| **Analytics Recharts Chunk** | Loaded on initial load | Isolated to `/analytics` (403.28 KB) | Zero upfront bundle penalty |
| **Habit Toggle Network Call** | 5 HTTP requests (waterfall) | **1 POST HTTP request** | 80.0% Network Reduction |
| **Dashboard Query Count** | ~20 SQL queries (N+1 lazy) | **1 Batched SQL query** | ~85-90% DB Query Reduction |

---

## 13. Local Development Setup

### Prerequisites
* **Python 3.12+**
* **Node.js 18+ & npm**
* **Git**

### 1. Repository Clone
```bash
git clone https://github.com/your-username/habit-tracker.git
cd habit-tracker
```

### 2. Backend Setup
```bash
cd backend
python -m venv venv

# Windows PowerShell
.\venv\Scripts\Activate.ps1

# Linux / macOS
source venv/bin/activate

pip install -r requirements.txt
python -m uvicorn app.main:app --reload --app-dir .
```
Backend will start at `http://127.0.0.1:8000`.

### 3. Frontend Setup
```bash
cd ../frontend
npm install
npm run dev
```
Frontend will start at `http://localhost:5173`.

---

## 14. Environment Variables

Create `.env` files in `backend/` and `frontend/` directories as needed:

### Backend `.env`
```env
PROJECT_NAME="Habit Tracker API"
SECRET_KEY="your_super_secret_jwt_key_here"
ACCESS_TOKEN_EXPIRE_MINUTES=1440
DATABASE_URL="sqlite:///./habit_tracker.db"
CORS_ORIGINS=["http://localhost:5173","http://localhost:3000"]
```

### Frontend `.env`
```env
VITE_API_BASE_URL="http://localhost:8000/api/v1"
```

---

## 15. Testing

The backend test suite is written using **Pytest** and **Httpx TestClient**.

### Execution Command
```bash
cd backend
.\venv\Scripts\pytest.exe
```

### Verification Test Suite Results
```text
============================= test session starts =============================
platform win32 -- Python 3.12.2, pytest-8.4.2
rootdir: C:\Users\dimpl\Downloads\LALIT PROJECTS\Habit Tracker\backend
plugins: anyio-4.14.2
collected 36 items

tests\test_admin.py ...                                                  [  8%]
tests\test_analytics_and_gamification.py ....                            [ 19%]
tests\test_api_validation.py ...                                         [ 27%]
tests\test_auth.py .........                                             [ 52%]
tests\test_completions.py ...                                            [ 61%]
tests\test_habits.py ........                                            [ 83%]
tests\test_main.py ...                                                   [ 91%]
tests\test_streaks.py ...                                                [100%]

============================= 36 passed in 22.85s =============================
```

---

## 16. Deployment

HabitFlow includes a production-ready **Docker Compose** containerization setup.

```yaml
version: '3.8'

services:
  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: habit_user
      POSTGRES_PASSWORD: habit_password
      POSTGRES_DB: habit_tracker
    volumes:
      - postgres_data:/var/lib/postgresql/data

  backend:
    build: ./backend
    command: uvicorn app.main:app --host 0.0.0.0 --port 8000
    environment:
      DATABASE_URL: postgresql://habit_user:habit_password@db:5432/habit_tracker
    depends_on:
      - db

  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend

volumes:
  postgres_data:
```

### Run Production Stack
```bash
docker-compose up --build -d
```

---

## 17. Screenshots & UI Showcase

| Dashboard Overview | Analytics & Heatmaps |
| :---: | :---: |
| *Today's habit list, execution gauge & streaks* | *Weekly bar chart & category distribution* |

| Monthly Calendar Grid | User Profile & Security |
| :---: | :---: |
| *Monthly completion density inspection* | *Health parameters & password reset* |

---

## 18. Future Improvements

* [ ] **Real-Time WebSockets**: Push notifications for daily habit reminders and instant streak updates across multiple active browser sessions.
* [ ] **Social Habit Challenges**: Shared team habit goals with group progress leaderboards.
* [ ] **Export Data Utility**: One-click CSV and JSON data export for offline data analysis.
* [ ] **PWA Support**: Offline-first service worker caching for full mobile web app installation.

---

<p align="center">
Built with ❤️ using Python, FastAPI, React 18, and PostgreSQL.
</p>
