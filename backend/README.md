# K&P Love — Backend API

> A secure, private backend exclusively for **Kashish Shrestha** & **Preshna GC** 💕

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | FastAPI (Python 3.13+) |
| ASGI Server | Uvicorn |
| Database | Supabase (PostgreSQL) |
| ORM | SQLAlchemy 2.0 (Async) |
| Migrations | Alembic |
| Auth | JWT (Access + Refresh tokens) |
| Password Hashing | Argon2 (via passlib) |
| Real-time | FastAPI WebSockets |
| Storage | Supabase Storage |
| Push Notifications | Firebase Cloud Messaging |
| Logging | Loguru |
| Testing | Pytest + pytest-asyncio |

---

## Project Structure

```
backend/
├── app/
│   ├── api/              # Route handlers (thin controllers)
│   │   ├── auth.py
│   │   ├── chat.py
│   │   ├── location.py
│   │   ├── memories.py
│   │   ├── notes.py
│   │   ├── events.py
│   │   ├── notifications.py
│   │   ├── playlist.py
│   │   └── storage.py
│   ├── core/
│   │   ├── config.py     # Settings (pydantic-settings)
│   │   ├── security.py   # JWT + Argon2 password hashing
│   │   └── logging.py    # Loguru setup
│   ├── database/
│   │   ├── base.py       # SQLAlchemy declarative base
│   │   └── session.py    # Async engine + session factory
│   ├── models/           # SQLAlchemy ORM models
│   ├── schemas/          # Pydantic v2 request/response schemas
│   ├── repositories/     # Data access layer (repository pattern)
│   ├── services/         # Business logic
│   ├── dependencies/     # FastAPI dependency injection
│   ├── middleware/        # HTTP middleware
│   ├── websocket/        # WebSocket manager + router
│   └── utils/            # Error handlers, helpers
├── alembic/              # Database migrations
│   └── versions/
│       └── 001_initial_schema.py
├── scripts/
│   └── seed.py           # Seed the two predefined users
├── tests/                # Pytest test suite
├── .env.example
├── alembic.ini
├── pytest.ini
├── requirements.txt
└── README.md
```

---

## Quick Start

### 1. Prerequisites

- Python 3.13+
- A [Supabase](https://supabase.com) project (free tier works)
- (Optional) Firebase project for push notifications

### 2. Clone & Install

```bash
cd backend
python -m venv .venv

# Windows
.venv\Scripts\activate

# macOS / Linux
source .venv/bin/activate

pip install -r requirements.txt
```

### 3. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` and fill in:

```env
SECRET_KEY=<generate with: python -c "import secrets; print(secrets.token_hex(32))">
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_DB_URL=postgresql+asyncpg://postgres:password@db.your-project.supabase.co:5432/postgres
GOOGLE_MAPS_API_KEY=your-key   # optional
```

### 4. Run Migrations

```bash
# From backend/ directory
alembic upgrade head
```

### 5. Seed the Database

```bash
python -m scripts.seed
```

This creates exactly two users:
- **Kashish** / password: `Preshna` (Boyfriend)
- **Preshna** / password: `Kashish` (Girlfriend)

Passwords are stored as Argon2 hashes — never plaintext.

### 6. Start the Server

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

API docs: http://localhost:8000/docs
Health check: http://localhost:8000/health

---

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/login` | Login with username + password |
| POST | `/api/auth/refresh` | Get new access token using refresh token |
| POST | `/api/auth/logout` | Logout, set user offline |
| GET | `/api/auth/me` | Get current user profile |

### Chat

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/chat/messages` | Get conversation history |
| POST | `/api/chat/send` | Send a message |
| PUT | `/api/chat/{id}` | Edit a message |
| DELETE | `/api/chat/{id}` | Soft-delete a message |
| GET | `/api/chat/unread` | Get unread message count |

### Live Location

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/location/update` | Update GPS coordinates |
| GET | `/api/location/me` | Get my last location |
| GET | `/api/location/partner` | Get partner's last location |
| GET | `/api/location/both` | Get both locations + distance |

### Memories

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/memories` | List all memories |
| POST | `/api/memories` | Upload a memory (multipart form) |
| PUT | `/api/memories/{id}` | Update memory metadata |
| DELETE | `/api/memories/{id}` | Delete a memory |

### Love Notes

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/notes` | List all notes |
| POST | `/api/notes` | Create a note |
| PUT | `/api/notes/{id}` | Update a note |
| DELETE | `/api/notes/{id}` | Delete a note |

### Calendar

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/events` | List all events |
| POST | `/api/events` | Create an event |
| PUT | `/api/events/{id}` | Update an event |
| DELETE | `/api/events/{id}` | Delete an event |

### Notifications

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/notifications` | List notifications |
| PUT | `/api/notifications/read` | Mark all as read |

### Playlist

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/playlist` | List playlist |
| POST | `/api/playlist` | Add a track |
| DELETE | `/api/playlist/{id}` | Remove a track |

### Storage (File Upload)

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/storage/avatar` | Upload profile photo |
| POST | `/api/storage/voice` | Upload voice note |

---

## WebSocket

Connect to `ws://localhost:8000/ws?token=<access_token>`

### Client → Server Events

```json
{ "event": "ping" }
{ "event": "typing", "typing": true }
{ "event": "read_receipt" }
```

### Server → Client Events

```json
{ "event": "pong" }
{ "event": "new_message", "data": {...} }
{ "event": "typing", "user_id": "...", "typing": true }
{ "event": "read_receipt", "reader_id": "..." }
{ "event": "user_status", "user_id": "...", "online": true }
{ "event": "location_update", "user_id": "...", "data": {...} }
```

---

## Running Tests

```bash
# Install test extras (aiosqlite for in-memory DB)
pip install aiosqlite

# Run all tests
pytest

# Run specific test file
pytest tests/test_auth.py -v

# Coverage report
pytest --cov=app --cov-report=html
```

---

## Supabase Setup

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **Settings → Database** to get the connection string
3. Go to **Settings → API** for the anon/service role keys
4. Create storage buckets:
   - `avatars` (public)
   - `memories` (public)
   - `voices` (private)
   - `files` (private)

---

## Security Notes

- Passwords are hashed with **Argon2** (memory-hard, resistant to GPU attacks)
- JWT access tokens expire in **30 minutes**; refresh tokens in **30 days**
- No registration endpoint exists — only the two predefined users can ever log in
- All endpoints require a valid Bearer token (except `/health`, `/`, `/docs`)
- Rate limiting: 200 requests/minute per IP
- CORS restricted to configured origins
- SQL injection prevented by SQLAlchemy parameterized queries
- File uploads validated by MIME type and size (max 50 MB)

---

## Deployment

For production:

1. Set `APP_ENV=production` — disables `/docs` and enables JSON logging
2. Set a strong `SECRET_KEY` (min 32 random bytes)
3. Use HTTPS (put behind nginx or a cloud load balancer)
4. Set `DEBUG=false`
5. Configure `CORS_ORIGINS` to your frontend domain only

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 2
```

---

Made with 💕 for Kashish & Preshna
