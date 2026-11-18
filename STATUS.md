# Calma WorkSpace Status

## Current state

Phase 0 through F4 are complete. F1 was merged into the default GitHub `main`
branch through [PR #1](https://github.com/medjmalami/calma-workspace/pull/1).
The current pushed commit is `8c79790`.

## Completed

- Node.js and Express backend scaffold
- Layered backend folders for routes, controllers, services, repositories, validators, middleware, and database code
- Centralized environment and tunable booking configuration
- PostgreSQL development and test containers in `docker-compose.yml`
- Plain SQL migration runner with transaction handling and advisory locking
- Initial `btree_gist` PostgreSQL extension migration for later reservation constraints
- Shared JSON error handler, not-found handling, and validation middleware
- `GET /health` endpoint
- Jest and Supertest API tests
- ESLint configuration
- Minimal React/Vite frontend foundation screen
- `.env.example`, package lockfiles, and setup documentation
- React classic JSX runtime fix for the frontend blank-page error
- F1 client registration and profile-domain foundation for all four client
  types, with bcrypt-backed credentials, strict validation, duplicate-email
  conflicts, and a minimal registration screen
- F2 client login, short-lived JWTs, bearer authentication, generic RBAC,
  login rate limiting, non-enumerating credential failures, and protected
  profile routes
- F3 manager-only room configuration CRUD with case-insensitive unique names,
  capacity validation, and soft deactivation
- F4 timezone-aware availability search with opening-hour, duration, future
  start, capacity, and buffered reservation-overlap rules
- F2–F4 frontend handoff screen for sign-in and availability search

## Verification completed

- Jest: 12 test suites and 50 tests passing
- ESLint: passing
- Frontend production build: passing
- Docker Compose configuration: valid
- Development and test database migrations: applied successfully on the
  documented isolated ports (`55432`/`55433`)
- F1 manual API smoke checks: registration `201`, duplicate email `409`, and
  role injection `422`

## Remaining increments

### Increment 1

- F1: Account and profile management for STUDENT, PUPIL, DEVELOPER, and ENTREPRENEUR clients — complete
- F2: Secure authentication, JWTs, bcrypt hashing, RBAC, login rate limiting, and non-enumerating errors — complete
- F3: Manager room configuration CRUD and safe deactivation — complete
- F4: Availability search by date, time slot, and attendee count — complete

### Increment 2

- F5: Reservation creation
- F6: Overlap, capacity, duration, buffer, opening-hours, and purpose/attendee enforcement

### Increment 3

- F7: Price calculation in integer millimes
- F8: Payment recording and printable/JSON receipts
- F9: Follow-up-agent day planning with payment status

## Not implemented

- Staff-account provisioning, reservation creation, payments, and receipts
- Optional subscriptions, parental authorization, cancellation, notifications, attendance tracking, and dashboards

## Next action

Stop after F4. Begin F5 only after the user says `next`.
