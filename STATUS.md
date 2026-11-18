# Calma WorkSpace Status

## Current state

Phase 0 is complete. The default GitHub branch is `main`, and the current pushed commit is `1bebc4a` (`fix: import React for classic JSX runtime`).

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

## Verification completed

- Jest: 2 test suites and 2 tests passing
- ESLint: passing
- Frontend production build: passing
- Docker Compose configuration: valid
- Development and test database migrations: applied successfully

## Remaining increments

### Increment 1

- F1: Account and profile management for STUDENT, PUPIL, DEVELOPER, and ENTREPRENEUR clients
- F2: Secure authentication, JWTs, bcrypt hashing, RBAC, login rate limiting, and non-enumerating errors
- F3: Manager room configuration CRUD and safe deactivation
- F4: Availability search by date, time slot, and attendee count

### Increment 2

- F5: Reservation creation
- F6: Overlap, capacity, duration, buffer, opening-hours, and purpose/attendee enforcement

### Increment 3

- F7: Price calculation in integer millimes
- F8: Payment recording and printable/JSON receipts
- F9: Follow-up-agent day planning with payment status

## Not implemented

- Domain tables beyond the initial PostgreSQL extension migration
- Client accounts, staff accounts, rooms, reservations, payments, and receipts
- Optional subscriptions, parental authorization, cancellation, notifications, attendance tracking, and dashboards

## Next action

Begin F1 only after the user says `next`.
