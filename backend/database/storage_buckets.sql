-- =============================================================
-- K&P Love — Supabase Storage Buckets
-- Run this in Supabase → SQL Editor AFTER schema.sql
-- =============================================================

-- Create buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
    (
        'avatars',
        'avatars',
        TRUE,
        5242880,   -- 5 MB
        ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    ),
    (
        'memories',
        'memories',
        TRUE,
        52428800,  -- 50 MB
        ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif',
              'video/mp4', 'video/webm', 'video/quicktime']
    ),
    (
        'voices',
        'voices',
        FALSE,
        10485760,  -- 10 MB
        ARRAY['audio/mpeg', 'audio/ogg', 'audio/wav', 'audio/webm', 'audio/mp4']
    ),
    (
        'files',
        'files',
        FALSE,
        52428800,  -- 50 MB
        NULL       -- any mime type
    )
ON CONFLICT (id) DO NOTHING;


-- ── Storage RLS Policies ──────────────────────────────────────────────────────

-- AVATARS (public bucket)
DROP POLICY IF EXISTS "avatars_public_read"  ON storage.objects;
DROP POLICY IF EXISTS "avatars_auth_upload"  ON storage.objects;
DROP POLICY IF EXISTS "avatars_auth_delete"  ON storage.objects;

CREATE POLICY "avatars_public_read" ON storage.objects
    FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "avatars_auth_upload" ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (bucket_id = 'avatars');

CREATE POLICY "avatars_auth_delete" ON storage.objects
    FOR DELETE TO authenticated
    USING (bucket_id = 'avatars');


-- MEMORIES (public bucket)
DROP POLICY IF EXISTS "memories_public_read"  ON storage.objects;
DROP POLICY IF EXISTS "memories_auth_upload"  ON storage.objects;
DROP POLICY IF EXISTS "memories_auth_delete"  ON storage.objects;

CREATE POLICY "memories_public_read" ON storage.objects
    FOR SELECT USING (bucket_id = 'memories');

CREATE POLICY "memories_auth_upload" ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (bucket_id = 'memories');

CREATE POLICY "memories_auth_delete" ON storage.objects
    FOR DELETE TO authenticated
    USING (bucket_id = 'memories');


-- VOICES (private — authenticated only)
DROP POLICY IF EXISTS "voices_auth_read"    ON storage.objects;
DROP POLICY IF EXISTS "voices_auth_upload"  ON storage.objects;
DROP POLICY IF EXISTS "voices_auth_delete"  ON storage.objects;

CREATE POLICY "voices_auth_read" ON storage.objects
    FOR SELECT TO authenticated
    USING (bucket_id = 'voices');

CREATE POLICY "voices_auth_upload" ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (bucket_id = 'voices');

CREATE POLICY "voices_auth_delete" ON storage.objects
    FOR DELETE TO authenticated
    USING (bucket_id = 'voices');


-- FILES (private — authenticated only)
DROP POLICY IF EXISTS "files_auth_read"    ON storage.objects;
DROP POLICY IF EXISTS "files_auth_upload"  ON storage.objects;
DROP POLICY IF EXISTS "files_auth_delete"  ON storage.objects;

CREATE POLICY "files_auth_read" ON storage.objects
    FOR SELECT TO authenticated
    USING (bucket_id = 'files');

CREATE POLICY "files_auth_upload" ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (bucket_id = 'files');

CREATE POLICY "files_auth_delete" ON storage.objects
    FOR DELETE TO authenticated
    USING (bucket_id = 'files');


-- Verify buckets
SELECT id, name, public, file_size_limit FROM storage.buckets
WHERE id IN ('avatars', 'memories', 'voices', 'files');
