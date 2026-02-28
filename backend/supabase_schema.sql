-- ============================================================
-- Legistra — Supabase PostgreSQL Schema
-- Run this in the Supabase SQL Editor to bootstrap your database.
-- ============================================================

-- 1. USERS
CREATE TABLE IF NOT EXISTS users (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email       TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    first_name  TEXT,
    last_name   TEXT,
    created_at  TIMESTAMPTZ DEFAULT now(),
    updated_at  TIMESTAMPTZ DEFAULT now()
);

-- 2. DOCUMENTS
CREATE TABLE IF NOT EXISTS documents (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id       UUID REFERENCES users(id) ON DELETE CASCADE,
    filename      TEXT NOT NULL,
    content       TEXT,
    file_path     TEXT,            -- legacy local path (kept for migration)
    storage_path  TEXT,            -- Supabase Storage object path
    file_size     INTEGER DEFAULT 0,
    text_length   INTEGER DEFAULT 0,
    document_type TEXT DEFAULT 'txt',
    status        TEXT DEFAULT 'uploaded',  -- uploaded | processing | completed | error
    upload_time   TIMESTAMPTZ DEFAULT now()
);

-- 3. ANALYSIS RESULTS
CREATE TABLE IF NOT EXISTS analysis_results (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id      UUID REFERENCES documents(id) ON DELETE CASCADE,
    user_id          UUID REFERENCES users(id) ON DELETE SET NULL,
    analysis_results JSONB NOT NULL DEFAULT '{}',
    status           TEXT DEFAULT 'completed',
    processing_time  REAL DEFAULT 0,
    model_versions   JSONB DEFAULT '{}',
    created_at       TIMESTAMPTZ DEFAULT now()
);

-- 4. USER SESSIONS
CREATE TABLE IF NOT EXISTS user_sessions (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_token  TEXT UNIQUE NOT NULL,
    created_at     TIMESTAMPTZ DEFAULT now(),
    last_activity  TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- INDEXES — optimise the most common query patterns
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_users_email            ON users(email);
CREATE INDEX IF NOT EXISTS idx_documents_user_id      ON documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_status       ON documents(status);
CREATE INDEX IF NOT EXISTS idx_documents_upload_time  ON documents(upload_time DESC);
CREATE INDEX IF NOT EXISTS idx_analysis_document_id   ON analysis_results(document_id);
CREATE INDEX IF NOT EXISTS idx_analysis_user_id       ON analysis_results(user_id);
CREATE INDEX IF NOT EXISTS idx_analysis_status        ON analysis_results(status);
CREATE INDEX IF NOT EXISTS idx_sessions_token         ON user_sessions(session_token);

-- ============================================================
-- SUPABASE STORAGE — create a private bucket for uploaded docs
-- ============================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policy: authenticated users can upload to their own folder
CREATE POLICY "Users can upload documents"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'documents');

CREATE POLICY "Users can read own documents"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'documents');
