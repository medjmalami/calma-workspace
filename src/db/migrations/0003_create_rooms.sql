CREATE TABLE IF NOT EXISTS rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL CHECK (char_length(trim(name)) BETWEEN 1 AND 120),
  description TEXT CHECK (description IS NULL OR char_length(trim(description)) <= 500),
  capacity INTEGER NOT NULL CHECK (capacity > 0),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  deactivated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK ((is_active AND deactivated_at IS NULL) OR (NOT is_active AND deactivated_at IS NOT NULL))
);

CREATE UNIQUE INDEX IF NOT EXISTS rooms_name_lower_unique_idx
  ON rooms (lower(name));
