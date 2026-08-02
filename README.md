# K&P Love 💕

> A private digital world exclusively for **Kashish Shrestha** & **Preshna GC**

---

## What is this?

K&P Love is a full-stack private couples application — not a social network, not a public app. It's a secure, personal space built for exactly two people. Every feature is designed around warmth, trust, and intimacy.

---

## Features

| Screen | What it does |
|---|---|
| 🔐 Login | Private access — no sign-up, no OTP, just the two of you |
| 🏠 Home | Relationship day counter, quick actions, latest love note |
| 📍 Live Location | Real-time GPS map with distance between both users |
| 💬 Chat | Private messaging with typing indicators and read receipts |
| 📸 Memories | Pinterest-style gallery of shared photos and videos |
| 💌 Love Notes | Sticky-note style personal letters to each other |
| 📅 Calendar | Shared calendar — anniversaries, birthdays, date nights |
| 🎵 Playlist | Shared music playlist with an animated player |
| 🔔 Notifications | Timeline of activity between you two |
| 👤 Profile | Individual profile photos, relationship counter, stats |
| ⚙️ Settings | Dark mode, notification preferences, privacy controls |

---

## Tech Stack

### Frontend
| Layer | Technology |
|---|---|
| Framework | React 19 + TypeScript |
| Routing | TanStack Router (file-based) |
| Styling | Tailwind CSS v4 |
| UI Components | shadcn/ui (Radix UI) |
| Build Tool | Vite 8 |
| State | TanStack Query |

### Backend
| Layer | Technology |
|---|---|
| Framework | FastAPI (Python 3.13+) |
| Database | Supabase (PostgreSQL) |
| ORM | SQLAlchemy 2.0 (Async) |
| Migrations | Alembic |
| Auth | JWT (Access + Refresh tokens) |
| Password Hashing | Argon2id |
| Real-time | FastAPI WebSockets |
| File Storage | Supabase Storage |
| Push Notifications | Firebase Cloud Messaging |
| Logging | Loguru |
| Server | Uvicorn |

---

## Project Structure

```
private-pair-space/
├── src/
│   ├── assets/              # Shared images
│   ├── Logo_Photo/
│   │   ├── 1.jpg            # Preshna's profile photo (girlfriend)
│   │   └── 2.jpeg           # Kashish's profile photo (boyfriend)
│   ├── components/
│   │   ├── kp/              # App-specific components (Shell, nav)
│   │   └── ui/              # shadcn/ui primitives
│   ├── hooks/               # use-theme, use-mobile
│   ├── lib/
│   │   ├── kp-data.ts       # All app data + avatar exports
│   │   └── utils.ts
│   └── routes/              # File-based pages
│       ├── index.tsx         # Splash screen
│       ├── login.tsx
│       ├── home.tsx
│       ├── chat.tsx
│       ├── map.tsx
│       ├── memories/
│       ├── notes.tsx
│       ├── calendar.tsx
│       ├── playlist.tsx
│       ├── notifications.tsx
│       ├── profile.tsx
│       └── settings.tsx
├── backend/
│   ├── app/
│   │   ├── api/             # Route handlers
│   │   ├── core/            # Config, security, logging
│   │   ├── database/        # SQLAlchemy session + base
│   │   ├── models/          # ORM models
│   │   ├── schemas/         # Pydantic v2 schemas
│   │   ├── repositories/    # Data access layer
│   │   ├── services/        # Business logic
│   │   ├── dependencies/    # FastAPI DI
│   │   ├── middleware/      # HTTP logging
│   │   └── websocket/       # Real-time manager + router
│   ├── alembic/             # DB migrations
│   ├── database/            # SQL schema files
│   │   ├── schema.sql        # ← Run this in Supabase SQL Editor
│   │   └── ...
│   ├── scripts/
│   │   └── seed.py          # Creates Kashish & Preshna users
│   ├── tests/               # Pytest test suite
│   ├── .env                 # Environment variables (not committed)
│   ├── .env.example
│   └── requirements.txt
├── vite.config.ts
├── package.json
└── README.md
```

---

## Quick Start — Frontend

### Prerequisites
- Node.js 20+ and npm

### Install & Run

```sh
# Clone the repo
git clone <repository-url>
cd private-pair-space

# Install dependencies
npm install

# Start the dev server — opens http://localhost:5173 automatically
npm run dev
```

The browser opens at **http://localhost:5173** automatically.

### Other frontend commands

```sh
npm run build        # Production build
npm run preview      # Preview the production build locally
npm run lint         # ESLint
npm run format       # Prettier
```

---

## Quick Start — Backend

### Prerequisites
- Python 3.13+

### Install & Run

```sh
cd backend

# Create virtual environment
python -m venv .venv
.venv\Scripts\activate        # Windows
# source .venv/bin/activate   # macOS / Linux

# Install dependencies
pip install -r requirements.txt

# Copy and fill in environment variables
cp .env.example .env
# Edit .env — add your Supabase DB URL and credentials

# Run database migrations
alembic upgrade head

# Seed the two predefined users
python -m scripts.seed

# Start the API server
uvicorn app.main:app --reload --port 8000
```

API docs available at: **http://localhost:8000/docs**

---

## Database Setup (Supabase)

1. Go to [https://eylcotgelxdtjhjslhfk.supabase.co](https://eylcotgelxdtjhjslhfk.supabase.co)
2. Open **SQL Editor → New Query**
3. Paste the entire contents of `backend/database/schema.sql`
4. Click **Run**

This creates all 8 tables, enables Row Level Security, seeds Kashish & Preshna with hashed passwords, and creates the 4 storage buckets in one go.

### Database Tables

| Table | Purpose |
|---|---|
| `users` | Kashish & Preshna — exactly 2 rows |
| `messages` | Private chat messages |
| `live_locations` | Real-time GPS — 1 row per user, upserted |
| `memories` | Shared photos and videos |
| `love_notes` | Private letters |
| `calendar_events` | Shared couple calendar |
| `notifications` | In-app notifications |
| `playlist` | Shared music playlist |

---

## Authentication

No registration. No sign-up. No forgot password. No OTP.

Only login — two predefined users:

| User | Display Name | Role | Password |
|---|---|---|---|
| `Kashish` | Kashish Shrestha | Boyfriend | `Preshna` |
| `Preshna` | Preshna GC | Girlfriend | `Kashish` |

Passwords are stored as **Argon2id hashes** — never plaintext.

---

## API Endpoints (Backend)

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/refresh` | Refresh access token |
| POST | `/api/auth/logout` | Logout |
| GET | `/api/auth/me` | Current user |
| GET | `/api/chat/messages` | Message history |
| POST | `/api/chat/send` | Send message |
| PUT | `/api/chat/{id}` | Edit message |
| DELETE | `/api/chat/{id}` | Delete message |
| POST | `/api/location/update` | Update GPS |
| GET | `/api/location/both` | Both locations + distance |
| GET | `/api/memories` | List memories |
| POST | `/api/memories` | Upload memory |
| GET | `/api/notes` | List love notes |
| POST | `/api/notes` | Create note |
| GET | `/api/events` | Calendar events |
| POST | `/api/events` | Create event |
| GET | `/api/notifications` | Notifications |
| PUT | `/api/notifications/read` | Mark all read |
| GET | `/api/playlist` | Playlist |
| POST | `/api/playlist` | Add track |
| `WS` | `/ws?token=...` | WebSocket — real-time events |

---

## WebSocket Events

Connect: `ws://localhost:8000/ws?token=<access_token>`

| Direction | Event | Description |
|---|---|---|
| Client → Server | `ping` | Keepalive |
| Client → Server | `typing` | Typing indicator |
| Client → Server | `read_receipt` | Mark messages read |
| Server → Client | `pong` | Keepalive reply |
| Server → Client | `new_message` | Incoming message |
| Server → Client | `typing` | Partner is typing |
| Server → Client | `read_receipt` | Messages were read |
| Server → Client | `user_status` | Online / offline |
| Server → Client | `location_update` | Partner's GPS updated |

---

## Environment Variables

Copy `backend/.env.example` to `backend/.env` and fill in:

```env
SECRET_KEY=<min 32 random chars>
SUPABASE_URL=https://eylcotgelxdtjhjslhfk.supabase.co
SUPABASE_ANON_KEY=<your anon key>
SUPABASE_SERVICE_ROLE_KEY=<your service role key>
SUPABASE_DB_URL=postgresql+asyncpg://postgres.<ref>:<password>@<host>:5432/postgres
GOOGLE_MAPS_API_KEY=<optional>
FIREBASE_CREDENTIALS_PATH=firebase-credentials.json
```

---

## Design

- **Color palette** — Soft Pink (`#F48FB1`), Rose Pink (`#EC407A`), Lavender (`#B39DDB`), Gold (`#FFD54F`), Coral (`#FF8A65`)
- **Typography** — Poppins (headings), Inter (body), Caveat (handwritten notes)
- **Style** — Glassmorphism cards, gradient backgrounds, smooth micro-animations
- **Dark mode** — Matte black with soft pink accents, toggled from Profile → Settings

---

## Running Tests (Backend)

```sh
cd backend
pip install aiosqlite  # in-memory test DB
pytest
```

---

Made with 💕 for Kashish & Preshna — always together.
