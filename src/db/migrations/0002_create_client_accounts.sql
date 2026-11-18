CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS client_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL CHECK (char_length(trim(name)) BETWEEN 1 AND 120),
  email TEXT NOT NULL UNIQUE CHECK (email = lower(email)),
  phone TEXT,
  client_type TEXT NOT NULL CHECK (
    client_type IN ('STUDENT', 'PUPIL', 'DEVELOPER', 'ENTREPRENEUR')
  ),
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS client_accounts_client_type_idx
  ON client_accounts (client_type);
