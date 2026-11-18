# Calma WorkSpace Status

## Current state

Phase 0 and F1 are complete locally. F1 is implemented on
`feature/F1-account-profile`; the branch will be pushed after final
verification.

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

## Verification completed

- Jest: 4 test suites and 11 tests passing
- ESLint: passing
- Frontend production build: passing
- Docker Compose configuration: valid
- Development and test database migrations: applied successfully on the
  documented isolated ports (`55432`/`55433`)

## Remaining increments

### Increment 1

- F1: Account and profile management for STUDENT, PUPIL, DEVELOPER, and ENTREPRENEUR clients — complete
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

Stop after F1. Begin F2 only after the user says `next`.
