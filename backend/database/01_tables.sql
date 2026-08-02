-- =============================================================
-- K&P Love — Step 1: Create all tables
-- Supabase → SQL Editor → New Query → Paste → Run
-- Safe to re-run (uses IF NOT EXISTS / OR REPLACE)
-- =============================================================

-- Enable UUID support
CREATE EXTENSION IF NOT EXISTS "pgcrypto";


-- ── USERS ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
    id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    username      VARCHAR(50)  NOT NULL UNIQUE,
    display_name  VARCHAR(100) NOT NULL,
    role          VARCHAR(20)  NOT NULL CHECK (role IN ('boyfriend','girlfriend')),
    password_hash TEXT         NOT NULL,
    avatar_url    TEXT,
    online        BOOLEAN      NOT NULL DEFAULT FALSE,
    last_seen     TIMESTAMPTZ,
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- auto-stamp updated_at
CREATE OR REPLACE FUNCTION trg_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$;

DROP TRIGGER IF EXISTS set_users_updated_at ON users;
CREATE TRIGGER set_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION trg_set_updated_at();


-- ── MESSAGES ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS messages (
    id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id     UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    receiver_id   UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    message       TEXT,
    message_type  VARCHAR(20) NOT NULL DEFAULT 'text'
                  CHECK (message_type IN ('text','image','voice','file')),
    image_url     TEXT,
    voice_url     TEXT,
    file_url      TEXT,
    sent_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    delivered     BOOLEAN     NOT NULL DEFAULT FALSE,
    seen          BOOLEAN     NOT NULL DEFAULT FALSE,
    edited        BOOLEAN     NOT NULL DEFAULT FALSE,
    deleted       BOOLEAN     NOT NULL DEFAULT FALSE,
    CONSTRAINT chk_msg_content CHECK (
        message IS NOT NULL OR image_url IS NOT NULL OR
        voice_url IS NOT NULL OR file_url IS NOT NULL
    )
);
CREATE INDEX IF NOT EXISTS idx_messages_sender    ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver  ON messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_sent_at   ON messages(sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_unread    ON messages(receiver_id, seen)
    WHERE deleted = FALSE;


-- ── LIVE LOCATIONS ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS live_locations (
    id            UUID     PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id       UUID     NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    latitude      FLOAT8   NOT NULL CHECK (latitude  BETWEEN -90  AND  90),
    longitude     FLOAT8   NOT NULL CHECK (longitude BETWEEN -180 AND 180),
    accuracy      FLOAT8   CHECK (accuracy  >= 0),
    altitude      FLOAT8,
    heading       FLOAT8   CHECK (heading   BETWEEN 0 AND 360),
    speed         FLOAT8   CHECK (speed     >= 0),
    battery_level SMALLINT CHECK (battery_level BETWEEN 0 AND 100),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_live_locations_user ON live_locations(user_id);


-- ── MEMORIES ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS memories (
    id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    uploaded_by   UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    image_url     TEXT,
    video_url     TEXT,
    caption       VARCHAR(500),
    location_name VARCHAR(255),
    latitude      FLOAT8  CHECK (latitude  BETWEEN -90  AND  90),
    longitude     FLOAT8  CHECK (longitude BETWEEN -180 AND 180),
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_memory_media CHECK (
        image_url IS NOT NULL OR video_url IS NOT NULL
    )
);
CREATE INDEX IF NOT EXISTS idx_memories_uploaded_by ON memories(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_memories_created_at  ON memories(created_at DESC);


-- ── LOVE NOTES ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS love_notes (
    id         UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    title      VARCHAR(255) NOT NULL,
    content    TEXT         NOT NULL,
    created_by UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    favorite   BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_love_notes_created_by ON love_notes(created_by);
CREATE INDEX IF NOT EXISTS idx_love_notes_created_at ON love_notes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_love_notes_favorites  ON love_notes(favorite)
    WHERE favorite = TRUE;


-- ── CALENDAR EVENTS ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS calendar_events (
    id               UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    title            VARCHAR(255) NOT NULL,
    description      TEXT,
    event_date       TIMESTAMPTZ  NOT NULL,
    reminder_enabled BOOLEAN      NOT NULL DEFAULT FALSE,
    created_by       UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_calendar_event_date   ON calendar_events(event_date ASC);
CREATE INDEX IF NOT EXISTS idx_calendar_created_by   ON calendar_events(created_by);
CREATE INDEX IF NOT EXISTS idx_calendar_reminders    ON calendar_events(event_date)
    WHERE reminder_enabled = TRUE;


-- ── NOTIFICATIONS ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
    id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    receiver_id UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title       VARCHAR(255) NOT NULL,
    message     TEXT         NOT NULL,
    read        BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_notifications_receiver ON notifications(receiver_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread   ON notifications(receiver_id, read)
    WHERE read = FALSE;


-- ── PLAYLIST ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS playlist (
    id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    title       VARCHAR(255) NOT NULL,
    artist      VARCHAR(255),
    album       VARCHAR(255),
    cover_image TEXT,
    duration    INTEGER      CHECK (duration >= 0),
    audio_url   TEXT,
    created_by  UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_playlist_created_by ON playlist(created_by);
CREATE INDEX IF NOT EXISTS idx_playlist_created_at ON playlist(created_at DESC);


-- ── Verify all tables exist ───────────────────────────────────────────────────
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type   = 'BASE TABLE'
ORDER BY table_name;
