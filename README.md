# Calma WorkSpace

Calma WorkSpace is a room-booking API and React client for a shared work and revision center.

## Requirements

- Node.js 20 or newer
- npm
- Docker with Docker Compose

## Setup

```bash
cp .env.example .env
npm install
npm --prefix frontend install
docker compose up -d db test-db
npm run db:migrate
npm run db:migrate:test
```

The development API uses `http://localhost:3000`. The React development server uses `http://localhost:5173`.

## Development

```bash
npm run dev
npm run frontend:dev
```

Run the API and frontend commands in separate terminals.

## Tests and lint

```bash
npm test
npm run lint
npm run frontend:build
```

The test suite is configured for Jest and Supertest. Database-backed tests use
`TEST_DATABASE_URL` when migrations are applied.

## API smoke test

```bash
curl http://localhost:3000/health
```

Expected response:

```json
{"status":"ok","service":"calma-workspace"}
```

## F1 client registration

F1 exposes client registration for `STUDENT`, `PUPIL`, `DEVELOPER`, and
`ENTREPRENEUR` accounts. Email addresses are normalized to lowercase, phone is
optional, and passwords are stored as bcrypt hashes. Registration responses do
not contain password hashes.

```bash
curl -X POST http://localhost:3000/clients/register \
  -H 'Content-Type: application/json' \
  -d '{
    "name": "Ada Lovelace",
    "email": "ada@example.com",
    "phone": "+216 20 000 000",
    "clientType": "DEVELOPER",
    "password": "<at-least-8-characters>"
  }'
```

Profile business rules are available in the service layer: only name and
phone are mutable.

## F2 authentication and profiles

Clients sign in through `POST /auth/login`. Invalid email and password cases
share the same `401 AUTHENTICATION_FAILED` response. Successful responses
contain a short-lived JWT and the public client profile; password hashes are
never returned. The token is accepted as `Authorization: Bearer <token>` for
`GET /clients/me` and `PATCH /clients/me`.

```bash
curl -X POST http://localhost:3000/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"ada@example.com","password":"<password>"}'

curl http://localhost:3000/clients/me \
  -H 'Authorization: Bearer <token-from-login>'
```

Login attempts are rate-limited by `LOGIN_RATE_LIMIT_MAX` within
`RATE_LIMIT_WINDOW_MS`. `MANAGER` and `CLIENT` are supported by the generic
RBAC middleware; staff-account provisioning is not part of this increment.

## F3 manager room configuration

Manager-only room routes are available at `POST /rooms`, `GET /rooms`,
`GET /rooms/:id`, and `PATCH /rooms/:id`. Deactivation is a soft state change
and is available through `POST /rooms/:id/deactivate`,
`PATCH /rooms/:id/deactivate`, or `DELETE /rooms/:id`; room records are never
deleted. Room names are unique case-insensitively, and room capacity is
bounded by `MAX_ROOM_CAPACITY`.

```bash
curl -X POST http://localhost:3000/rooms \
  -H 'Authorization: Bearer <manager-token>' \
  -H 'Content-Type: application/json' \
  -d '{"name":"Focus Room A","capacity":6}'

curl -X DELETE http://localhost:3000/rooms/<room-id> \
  -H 'Authorization: Bearer <manager-token>'
```

## F4 availability search

`GET /rooms/availability` accepts a local date, time slot, and attendee count.
It uses `TIMEZONE` (default `Africa/Tunis`), opening hours, maximum duration,
and `BUFFER_MINUTES` from configuration. Active rooms with enough capacity are
returned only when no pending or confirmed reservation overlaps the buffered
slot.

```bash
curl 'http://localhost:3000/rooms/availability?date=2099-06-15&startTime=10:00&endTime=12:00&attendeeCount=4'
```

## Database migrations

Migrations are plain SQL files in `src/db/migrations`. The migration runner
records applied filenames in the `schema_migrations` table and applies each
pending migration in order inside a transaction. F3 creates `rooms`; F4 adds
the minimal `reservations` table foundation used by availability queries.
