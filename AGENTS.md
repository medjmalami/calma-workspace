# Calma WorkSpace Agent Instructions

## Project scope

Calma WorkSpace is a room-booking application for a shared work and revision center. The backend is an Express API with PostgreSQL; the frontend is React with Vite.

## Required workflow

- Implement features in order: F1 through F9.
- Work on one feature at a time and stop after that feature is complete.
- Before each feature, state the acceptance criteria as Given/When/Then and record assumptions. Ask the user when a requirement is materially ambiguous.
- Write failing unit and API acceptance tests before implementing the feature.
- Keep business rules in services and pure functions where practical.
- Add the smallest frontend screen needed for the completed API feature.
- Run the full test suite, lint, and the frontend build before handoff.
- Report changed files, manual curl examples, known limitations, and verification results.
- Do not start the next feature until the user says `next`.
- Do not implement optional features unless the user explicitly requests them.

## Architecture and conventions

- Backend code is organized under `src/routes`, `src/controllers`, `src/services`, `src/repositories`, `src/validators`, `src/middleware`, and `src/db`.
- Use parameterized SQL only.
- Validate every endpoint input with Zod (or an equivalent schema) before service logic.
- Use the shared error handler and stable error codes. Use `409` for conflicts and `422` for business-rule or validation failures.
- Keep all tunable business values in `src/config/index.js`; do not hardcode rates, durations, buffers, opening hours, or rate-limit values in feature code.
- Store money as integer millimes, never floating-point amounts.
- Store timestamps consistently and document any timezone assumptions.
- Never log or return passwords, password hashes, JWT secrets, or other credentials.

## Security and domain rules

- Only client accounts self-register. Staff accounts are created by a manager.
- Never accept a client-supplied role during registration or profile updates.
- Hash passwords with bcrypt and use short-lived JWTs.
- Apply RBAC middleware to staff-only operations and login rate limiting to authentication endpoints.
- Reservation overlap and buffer enforcement must be protected at the PostgreSQL/transaction level, not only in application code.
- Reservation rules must enforce room capacity, duration, future start times, opening hours, and purpose/attendee constraints.
- A reservation can have at most one payment, and only a payment agent or manager can record it.

## Git and handoff

- Use a feature branch named `feature/F<number>-<short-name>` for feature work.
- Keep commits small and use clear imperative messages.
- Do not rewrite history or force-push without explicit approval.
- Do not commit `.env`, credentials, build output, or dependency directories.
- Preserve unrelated user changes.

## Useful commands

```bash
npm install
npm --prefix frontend install
docker compose up -d db test-db
npm run db:migrate
npm run db:migrate:test
npm test
npm run lint
npm run frontend:build
npm run dev
npm run frontend:dev
```
