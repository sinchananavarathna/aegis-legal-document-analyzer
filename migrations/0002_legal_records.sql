-- Persistent, account-scoped legal documents and analysis results.
-- Keep all reads/writes scoped by the authenticated user_id in server functions.
CREATE TABLE IF NOT EXISTS legal_analyses (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  saved_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  score INTEGER NOT NULL CHECK (score BETWEEN 0 AND 100),
  result JSONB NOT NULL,
  original_file BYTEA,
  original_mime_type TEXT,
  original_size BIGINT
);

CREATE INDEX IF NOT EXISTS legal_analyses_user_saved_at_idx
  ON legal_analyses (user_id, saved_at DESC);

CREATE TABLE IF NOT EXISTS legal_comparisons (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  file_a TEXT NOT NULL,
  file_b TEXT NOT NULL,
  saved_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  result JSONB NOT NULL
);

CREATE INDEX IF NOT EXISTS legal_comparisons_user_saved_at_idx
  ON legal_comparisons (user_id, saved_at DESC);
