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

The test suite is configured for Jest and Supertest. Database-backed tests will use `TEST_DATABASE_URL` when they are added.

## API smoke test

```bash
curl http://localhost:3000/health
```

Expected response:

```json
{"status":"ok","service":"calma-workspace"}
```

## Database migrations

Migrations are plain SQL files in `src/db/migrations`. The migration runner records applied filenames in the `schema_migrations` table and applies each pending migration in order inside a transaction.
