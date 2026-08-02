-- =============================================================
-- K&P Love — Complete Database Schema
-- Paste entirely into Supabase → SQL Editor → Run
-- Project: https://eylcotgelxdtjhjslhfk.supabase.co
-- =============================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";


-- =============================================================
-- TABLES
-- =============================================================

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

CREATE OR REPLACE FUNCTION trg_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$;
DROP TRIGGER IF EXISTS set_users_updated_at ON users;
CREATE TRIGGER set_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION trg_set_updated_at();


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
CREATE INDEX IF NOT EXISTS idx_messages_sender   ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver ON messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_sent_at  ON messages(sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_unread   ON messages(receiver_id, seen)
    WHERE deleted = FALSE;


CREATE TABLE IF NOT EXISTS live_locations (
    id            UUID     PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id       UUID     NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    latitude      FLOAT8   NOT NULL CHECK (latitude  BETWEEN -90  AND  90),
    longitude     FLOAT8   NOT NULL CHECK (longitude BETWEEN -180 AND 180),
    accuracy      FLOAT8   CHECK (accuracy >= 0),
    altitude      FLOAT8,
    heading       FLOAT8   CHECK (heading BETWEEN 0 AND 360),
    speed         FLOAT8   CHECK (speed >= 0),
    battery_level SMALLINT CHECK (battery_level BETWEEN 0 AND 100),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_live_locations_user ON live_locations(user_id);


CREATE TABLE IF NOT EXISTS memories (
    id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    uploaded_by   UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    image_url     TEXT,
    video_url     TEXT,
    caption       VARCHAR(500),
    location_name VARCHAR(255),
    latitude      FLOAT8  CHECK (latitude  BETWEEN -90  AND  90),
    longitude     FLOAT8  CHECK (longitude BETWEEN -180 AND 180),
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_memory_media CHECK (
        image_url IS NOT NULL OR video_url IS NOT NULL
    )
);
CREATE INDEX IF NOT EXISTS idx_memories_uploaded_by ON memories(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_memories_created_at  ON memories(created_at DESC);


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
CREATE INDEX IF NOT EXISTS idx_love_notes_favorites  ON love_notes(favorite) WHERE favorite = TRUE;


CREATE TABLE IF NOT EXISTS calendar_events (
    id               UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    title            VARCHAR(255) NOT NULL,
    description      TEXT,
    event_date       TIMESTAMPTZ  NOT NULL,
    reminder_enabled BOOLEAN      NOT NULL DEFAULT FALSE,
    created_by       UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_calendar_event_date ON calendar_events(event_date ASC);
CREATE INDEX IF NOT EXISTS idx_calendar_created_by ON calendar_events(created_by);
CREATE INDEX IF NOT EXISTS idx_calendar_reminders  ON calendar_events(event_date)
    WHERE reminder_enabled = TRUE;


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


-- =============================================================
-- ROW LEVEL SECURITY
-- =============================================================

ALTER TABLE users            ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages         ENABLE ROW LEVEL SECURITY;
ALTER TABLE live_locations   ENABLE ROW LEVEL SECURITY;
ALTER TABLE memories         ENABLE ROW LEVEL SECURITY;
ALTER TABLE love_notes       ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events  ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications    ENABLE ROW LEVEL SECURITY;
ALTER TABLE playlist         ENABLE ROW LEVEL SECURITY;

-- ── users ─────────────────────────────────────────────────────
DROP POLICY IF EXISTS "users_select"     ON users;
DROP POLICY IF EXISTS "users_update_own" ON users;
CREATE POLICY "users_select"     ON users FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "users_update_own" ON users FOR UPDATE TO authenticated
    USING (id = (SELECT id FROM users WHERE username = auth.jwt()->>'username' LIMIT 1));

-- ── messages ──────────────────────────────────────────────────
DROP POLICY IF EXISTS "messages_select"     ON messages;
DROP POLICY IF EXISTS "messages_insert"     ON messages;
DROP POLICY IF EXISTS "messages_update_own" ON messages;
CREATE POLICY "messages_select"     ON messages FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "messages_insert"     ON messages FOR INSERT TO authenticated
    WITH CHECK (sender_id = (SELECT id FROM users WHERE username = auth.jwt()->>'username' LIMIT 1));
CREATE POLICY "messages_update_own" ON messages FOR UPDATE TO authenticated
    USING (sender_id = (SELECT id FROM users WHERE username = auth.jwt()->>'username' LIMIT 1));

-- ── live_locations ────────────────────────────────────────────
DROP POLICY IF EXISTS "locations_select" ON live_locations;
DROP POLICY IF EXISTS "locations_all"    ON live_locations;
CREATE POLICY "locations_select" ON live_locations FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "locations_all"    ON live_locations FOR ALL    TO authenticated
    USING      (user_id = (SELECT id FROM users WHERE username = auth.jwt()->>'username' LIMIT 1))
    WITH CHECK (user_id = (SELECT id FROM users WHERE username = auth.jwt()->>'username' LIMIT 1));

-- ── memories ──────────────────────────────────────────────────
DROP POLICY IF EXISTS "memories_select"     ON memories;
DROP POLICY IF EXISTS "memories_insert"     ON memories;
DROP POLICY IF EXISTS "memories_update_own" ON memories;
DROP POLICY IF EXISTS "memories_delete_own" ON memories;
CREATE POLICY "memories_select"     ON memories FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "memories_insert"     ON memories FOR INSERT TO authenticated
    WITH CHECK (uploaded_by = (SELECT id FROM users WHERE username = auth.jwt()->>'username' LIMIT 1));
CREATE POLICY "memories_update_own" ON memories FOR UPDATE TO authenticated
    USING (uploaded_by = (SELECT id FROM users WHERE username = auth.jwt()->>'username' LIMIT 1));
CREATE POLICY "memories_delete_own" ON memories FOR DELETE TO authenticated
    USING (uploaded_by = (SELECT id FROM users WHERE username = auth.jwt()->>'username' LIMIT 1));

-- ── love_notes ────────────────────────────────────────────────
DROP POLICY IF EXISTS "notes_select"     ON love_notes;
DROP POLICY IF EXISTS "notes_insert"     ON love_notes;
DROP POLICY IF EXISTS "notes_update_own" ON love_notes;
DROP POLICY IF EXISTS "notes_delete_own" ON love_notes;
CREATE POLICY "notes_select"     ON love_notes FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "notes_insert"     ON love_notes FOR INSERT TO authenticated
    WITH CHECK (created_by = (SELECT id FROM users WHERE username = auth.jwt()->>'username' LIMIT 1));
CREATE POLICY "notes_update_own" ON love_notes FOR UPDATE TO authenticated
    USING (created_by = (SELECT id FROM users WHERE username = auth.jwt()->>'username' LIMIT 1));
CREATE POLICY "notes_delete_own" ON love_notes FOR DELETE TO authenticated
    USING (created_by = (SELECT id FROM users WHERE username = auth.jwt()->>'username' LIMIT 1));

-- ── calendar_events ───────────────────────────────────────────
DROP POLICY IF EXISTS "events_select" ON calendar_events;
DROP POLICY IF EXISTS "events_insert" ON calendar_events;
DROP POLICY IF EXISTS "events_update" ON calendar_events;
DROP POLICY IF EXISTS "events_delete" ON calendar_events;
CREATE POLICY "events_select" ON calendar_events FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "events_insert" ON calendar_events FOR INSERT TO authenticated
    WITH CHECK (created_by = (SELECT id FROM users WHERE username = auth.jwt()->>'username' LIMIT 1));
CREATE POLICY "events_update" ON calendar_events FOR UPDATE TO authenticated USING (TRUE);
CREATE POLICY "events_delete" ON calendar_events FOR DELETE TO authenticated USING (TRUE);

-- ── notifications ─────────────────────────────────────────────
DROP POLICY IF EXISTS "notifications_select" ON notifications;
DROP POLICY IF EXISTS "notifications_update" ON notifications;
CREATE POLICY "notifications_select" ON notifications FOR SELECT TO authenticated
    USING (receiver_id = (SELECT id FROM users WHERE username = auth.jwt()->>'username' LIMIT 1));
CREATE POLICY "notifications_update" ON notifications FOR UPDATE TO authenticated
    USING (receiver_id = (SELECT id FROM users WHERE username = auth.jwt()->>'username' LIMIT 1));

-- ── playlist ──────────────────────────────────────────────────
DROP POLICY IF EXISTS "playlist_select" ON playlist;
DROP POLICY IF EXISTS "playlist_insert" ON playlist;
DROP POLICY IF EXISTS "playlist_delete" ON playlist;
CREATE POLICY "playlist_select" ON playlist FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "playlist_insert" ON playlist FOR INSERT TO authenticated
    WITH CHECK (created_by = (SELECT id FROM users WHERE username = auth.jwt()->>'username' LIMIT 1));
CREATE POLICY "playlist_delete" ON playlist FOR DELETE TO authenticated USING (TRUE);


-- =============================================================
-- SEED — Kashish & Preshna with real Argon2id hashes
-- Kashish logs in with password: Preshna
-- Preshna logs in with password: Kashish
-- =============================================================

INSERT INTO users (username, display_name, role, password_hash, online, created_at, updated_at)
VALUES
(
    'Kashish',
    'Kashish Shrestha',
    'boyfriend',
    '$argon2id$v=19$m=65536,t=3,p=4$0hqjVGrtnXOulZKSsnaOsQ$fRWnOHT+SEz9aqIl8DHsAtpoip7fB5Z3iUeqkeiRHjg',
    FALSE, NOW(), NOW()
),
(
    'Preshna',
    'Preshna GC',
    'girlfriend',
    '$argon2id$v=19$m=65536,t=3,p=4$6723lvJ+r1UqZWytlVKqtQ$GfJkA8iVdNQM0REGrt1d0WbwlvzQCobG97so1ubDboE',
    FALSE, NOW(), NOW()
)
ON CONFLICT (username) DO UPDATE
    SET password_hash = EXCLUDED.password_hash,
        updated_at    = NOW();


-- =============================================================
-- STORAGE BUCKETS
-- =============================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
    ('avatars',  'avatars',  TRUE,  5242880,  ARRAY['image/jpeg','image/png','image/webp','image/gif']),
    ('memories', 'memories', TRUE,  52428800, ARRAY['image/jpeg','image/png','image/webp','image/gif','video/mp4','video/webm','video/quicktime']),
    ('voices',   'voices',   FALSE, 10485760, ARRAY['audio/mpeg','audio/ogg','audio/wav','audio/webm','audio/mp4']),
    ('files',    'files',    FALSE, 52428800, NULL)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "avatars_read"    ON storage.objects;
DROP POLICY IF EXISTS "avatars_upload"  ON storage.objects;
DROP POLICY IF EXISTS "avatars_delete"  ON storage.objects;
DROP POLICY IF EXISTS "memories_read"   ON storage.objects;
DROP POLICY IF EXISTS "memories_upload" ON storage.objects;
DROP POLICY IF EXISTS "memories_delete" ON storage.objects;
DROP POLICY IF EXISTS "voices_read"     ON storage.objects;
DROP POLICY IF EXISTS "voices_upload"   ON storage.objects;
DROP POLICY IF EXISTS "files_read"      ON storage.objects;
DROP POLICY IF EXISTS "files_upload"    ON storage.objects;

CREATE POLICY "avatars_read"    ON storage.objects FOR SELECT               USING  (bucket_id = 'avatars');
CREATE POLICY "avatars_upload"  ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'avatars');
CREATE POLICY "avatars_delete"  ON storage.objects FOR DELETE TO authenticated USING  (bucket_id = 'avatars');
CREATE POLICY "memories_read"   ON storage.objects FOR SELECT               USING  (bucket_id = 'memories');
CREATE POLICY "memories_upload" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'memories');
CREATE POLICY "memories_delete" ON storage.objects FOR DELETE TO authenticated USING  (bucket_id = 'memories');
CREATE POLICY "voices_read"     ON storage.objects FOR SELECT TO authenticated USING  (bucket_id = 'voices');
CREATE POLICY "voices_upload"   ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'voices');
CREATE POLICY "files_read"      ON storage.objects FOR SELECT TO authenticated USING  (bucket_id = 'files');
CREATE POLICY "files_upload"    ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'files');


-- =============================================================
-- VERIFY — should return 8 table names
-- =============================================================
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type   = 'BASE TABLE'
ORDER BY table_name;
