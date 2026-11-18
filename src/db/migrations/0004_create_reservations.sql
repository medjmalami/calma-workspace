CREATE TABLE IF NOT EXISTS reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES client_accounts (id),
  room_id UUID NOT NULL REFERENCES rooms (id),
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  attendee_count INTEGER NOT NULL CHECK (attendee_count > 0),
  purpose TEXT,
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (
    status IN ('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED')
  ),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (ends_at > starts_at)
);

CREATE INDEX IF NOT EXISTS reservations_room_time_idx
  ON reservations (room_id, starts_at, ends_at);

CREATE INDEX IF NOT EXISTS reservations_status_idx
  ON reservations (status);
