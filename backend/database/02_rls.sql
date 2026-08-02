-- =============================================================
-- K&P Love — Step 2: Row Level Security
-- Run AFTER 01_tables.sql
-- =============================================================

-- Enable RLS on all tables
ALTER TABLE users            ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages         ENABLE ROW LEVEL SECURITY;
ALTER TABLE live_locations   ENABLE ROW LEVEL SECURITY;
ALTER TABLE memories         ENABLE ROW LEVEL SECURITY;
ALTER TABLE love_notes       ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events  ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications    ENABLE ROW LEVEL SECURITY;
ALTER TABLE playlist         ENABLE ROW LEVEL SECURITY;


-- ── USERS ─────────────────────────────────────────────────────────────────────
-- Any authenticated user can view both profiles (need to see each other)
DROP POLICY IF EXISTS "users_select"       ON users;
DROP POLICY IF EXISTS "users_update_own"   ON users;

CREATE POLICY "users_select" ON users
    FOR SELECT TO authenticated USING (TRUE);

CREATE POLICY "users_update_own" ON users
    FOR UPDATE TO authenticated
    USING (id = (SELECT id FROM users WHERE username = auth.jwt()->>'username' LIMIT 1));


-- ── MESSAGES ──────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "messages_select"      ON messages;
DROP POLICY IF EXISTS "messages_insert"      ON messages;
DROP POLICY IF EXISTS "messages_update_own"  ON messages;
DROP POLICY IF EXISTS "messages_delete_own"  ON messages;

-- Both users can read the full conversation
CREATE POLICY "messages_select" ON messages
    FOR SELECT TO authenticated USING (TRUE);

-- Only sender can insert
CREATE POLICY "messages_insert" ON messages
    FOR INSERT TO authenticated
    WITH CHECK (
        sender_id = (SELECT id FROM users WHERE username = auth.jwt()->>'username' LIMIT 1)
    );

-- Only sender can edit/soft-delete
CREATE POLICY "messages_update_own" ON messages
    FOR UPDATE TO authenticated
    USING (
        sender_id = (SELECT id FROM users WHERE username = auth.jwt()->>'username' LIMIT 1)
    );


-- ── LIVE LOCATIONS ────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "locations_select"  ON live_locations;
DROP POLICY IF EXISTS "locations_all"     ON live_locations;

-- Both users can see each other's location
CREATE POLICY "locations_select" ON live_locations
    FOR SELECT TO authenticated USING (TRUE);

-- Each user can only write their own row
CREATE POLICY "locations_all" ON live_locations
    FOR ALL TO authenticated
    USING (
        user_id = (SELECT id FROM users WHERE username = auth.jwt()->>'username' LIMIT 1)
    )
    WITH CHECK (
        user_id = (SELECT id FROM users WHERE username = auth.jwt()->>'username' LIMIT 1)
    );


-- ── MEMORIES ──────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "memories_select"      ON memories;
DROP POLICY IF EXISTS "memories_insert"      ON memories;
DROP POLICY IF EXISTS "memories_update_own"  ON memories;
DROP POLICY IF EXISTS "memories_delete_own"  ON memories;

CREATE POLICY "memories_select" ON memories
    FOR SELECT TO authenticated USING (TRUE);

CREATE POLICY "memories_insert" ON memories
    FOR INSERT TO authenticated
    WITH CHECK (
        uploaded_by = (SELECT id FROM users WHERE username = auth.jwt()->>'username' LIMIT 1)
    );

CREATE POLICY "memories_update_own" ON memories
    FOR UPDATE TO authenticated
    USING (
        uploaded_by = (SELECT id FROM users WHERE username = auth.jwt()->>'username' LIMIT 1)
    );

CREATE POLICY "memories_delete_own" ON memories
    FOR DELETE TO authenticated
    USING (
        uploaded_by = (SELECT id FROM users WHERE username = auth.jwt()->>'username' LIMIT 1)
    );


-- ── LOVE NOTES ────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "notes_select"      ON love_notes;
DROP POLICY IF EXISTS "notes_insert"      ON love_notes;
DROP POLICY IF EXISTS "notes_update_own"  ON love_notes;
DROP POLICY IF EXISTS "notes_delete_own"  ON love_notes;

CREATE POLICY "notes_select" ON love_notes
    FOR SELECT TO authenticated USING (TRUE);

CREATE POLICY "notes_insert" ON love_notes
    FOR INSERT TO authenticated
    WITH CHECK (
        created_by = (SELECT id FROM users WHERE username = auth.jwt()->>'username' LIMIT 1)
    );

CREATE POLICY "notes_update_own" ON love_notes
    FOR UPDATE TO authenticated
    USING (
        created_by = (SELECT id FROM users WHERE username = auth.jwt()->>'username' LIMIT 1)
    );

CREATE POLICY "notes_delete_own" ON love_notes
    FOR DELETE TO authenticated
    USING (
        created_by = (SELECT id FROM users WHERE username = auth.jwt()->>'username' LIMIT 1)
    );


-- ── CALENDAR EVENTS ───────────────────────────────────────────────────────────
-- Shared calendar — both users can fully manage all events
DROP POLICY IF EXISTS "events_select"  ON calendar_events;
DROP POLICY IF EXISTS "events_insert"  ON calendar_events;
DROP POLICY IF EXISTS "events_update"  ON calendar_events;
DROP POLICY IF EXISTS "events_delete"  ON calendar_events;

CREATE POLICY "events_select" ON calendar_events
    FOR SELECT TO authenticated USING (TRUE);

CREATE POLICY "events_insert" ON calendar_events
    FOR INSERT TO authenticated
    WITH CHECK (
        created_by = (SELECT id FROM users WHERE username = auth.jwt()->>'username' LIMIT 1)
    );

CREATE POLICY "events_update" ON calendar_events
    FOR UPDATE TO authenticated USING (TRUE);

CREATE POLICY "events_delete" ON calendar_events
    FOR DELETE TO authenticated USING (TRUE);


-- ── NOTIFICATIONS ─────────────────────────────────────────────────────────────
-- Each user can only see their own notifications
DROP POLICY IF EXISTS "notifications_select"  ON notifications;
DROP POLICY IF EXISTS "notifications_update"  ON notifications;

CREATE POLICY "notifications_select" ON notifications
    FOR SELECT TO authenticated
    USING (
        receiver_id = (SELECT id FROM users WHERE username = auth.jwt()->>'username' LIMIT 1)
    );

CREATE POLICY "notifications_update" ON notifications
    FOR UPDATE TO authenticated
    USING (
        receiver_id = (SELECT id FROM users WHERE username = auth.jwt()->>'username' LIMIT 1)
    );


-- ── PLAYLIST ──────────────────────────────────────────────────────────────────
-- Shared playlist — both users can read, add, remove
DROP POLICY IF EXISTS "playlist_select"  ON playlist;
DROP POLICY IF EXISTS "playlist_insert"  ON playlist;
DROP POLICY IF EXISTS "playlist_delete"  ON playlist;

CREATE POLICY "playlist_select" ON playlist
    FOR SELECT TO authenticated USING (TRUE);

CREATE POLICY "playlist_insert" ON playlist
    FOR INSERT TO authenticated
    WITH CHECK (
        created_by = (SELECT id FROM users WHERE username = auth.jwt()->>'username' LIMIT 1)
    );

CREATE POLICY "playlist_delete" ON playlist
    FOR DELETE TO authenticated USING (TRUE);


-- ── Verify RLS is enabled ─────────────────────────────────────────────────────
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
