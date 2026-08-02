# K&P Love — Database Setup

Run these SQL files **in order** inside your Supabase project.

## How to Run

1. Go to [https://eylcotgelxdtjhjslhfk.supabase.co](https://eylcotgelxdtjhjslhfk.supabase.co)
2. Click **SQL Editor** in the left sidebar
3. Click **New Query**
4. Paste each file's contents and click **Run**

---

## Files — Run in this exact order

### Step 1 — `01_tables.sql`
Creates all 8 tables with constraints, indexes, and triggers.

Tables created:
| Table | Purpose |
|---|---|
| `users` | Kashish & Preshna — exactly 2 rows |
| `messages` | Private chat |
| `live_locations` | Real-time GPS (1 row per user, upserted) |
| `memories` | Shared photos & videos |
| `love_notes` | Love letters |
| `calendar_events` | Shared couple calendar |
| `notifications` | In-app push notifications |
| `playlist` | Shared music playlist |

### Step 2 — `02_rls.sql`
Enables Row Level Security on all tables.
Each user can only access data they're allowed to see.

### Step 3 — `03_seed.sql`
Inserts the two predefined users with **real Argon2id-hashed passwords**.

| User | Display Name | Role | Password |
|---|---|---|---|
| Kashish | Kashish Shrestha | boyfriend | `Preshna` |
| Preshna | Preshna GC | girlfriend | `Kashish` |

> Passwords are stored as Argon2id hashes — never plaintext.

### Step 4 — `storage_buckets.sql`
Creates the 4 Supabase Storage buckets with RLS policies.

| Bucket | Public | Max Size | Types |
|---|---|---|---|
| `avatars` | ✅ Yes | 5 MB | Images |
| `memories` | ✅ Yes | 50 MB | Images + Video |
| `voices` | 🔒 Auth only | 10 MB | Audio |
| `files` | 🔒 Auth only | 50 MB | Any |

---

## After Running SQL

Update your `.env` with the database connection string:

```
SUPABASE_DB_URL=postgresql+asyncpg://postgres.eylcotgelxdtjhjslhfk:[YOUR-PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres
```

Get the password from: **Supabase → Settings → Database → Connection string**

Then start the backend:
```bash
cd backend
uvicorn app.main:app --reload
```

Test login at: http://localhost:8000/docs → POST /api/auth/login
