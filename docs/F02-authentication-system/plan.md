# Implementation Plan: Authentication System

## Prerequisites

- Review `docs/F02-authentication-system/spec.md` before changing code.
- Follow the clean architecture dependency rule for all backend artifacts.
- Keep `process.env` access limited to `apps/backend/src/config/env.ts`.
- Use `./scripts/init.sh` for local runtime startup and `./scripts/stop.sh` for shutdown.
- Preserve F01 landing behavior while replacing its temporary session stub with the real F02 session boundary.

## Phase 1: Backend Auth Domain and Persistence

**1. User and session domain model** - Create the authentication domain objects for users, emails, password hashes, sessions, and token state. Keep business invariants in domain types and expose repository/gateway interfaces for persistence, hashing, and token generation.

**2. Database schema and migration** - Add the auth persistence model for users and database-backed sessions. Include the admin/status fields needed by future administration features and align the Prisma schema with the migration.

**3. Persistence adapters** - Add Prisma-backed user/session repositories, read queries, mappers, and named in-memory fakes. Keep concrete implementations in infra and wire them only from the composition root.

## Phase 2: Backend Auth Use Cases and HTTP

**4. Auth use cases** - Add register, login, logout, and current-session use cases. The use cases should orchestrate repository, hashing, and token concerns while leaving request-shape validation to handlers.

**5. HTTP auth handlers** - Add auth handlers and routes for registration, login, logout, and session lookup. Handlers should validate input, call a single use case, map outputs to response bodies/cookies, and let errors flow to the central error handler.

**6. Auth middleware boundary** - Replace the placeholder current-user middleware with session-backed request resolution. Downstream authenticated features should receive a typed user context without knowing how sessions are stored.

**7. Composition root wiring** - Update `apps/backend/src/main.ts` and the route builder so the backend starts with auth dependencies, repositories, gateways, handlers, and routes connected through constructor injection.

## Phase 3: Frontend Auth Proxy and UI

**8. Web auth proxy** - Add Next.js Route Handlers that proxy browser auth calls to the backend and preserve cookie behavior on the web origin. Keep backend-origin lookup centralized in web library code.

**9. Session boundary** - Replace the F01 anonymous-only session helper with a real server-side session lookup. Use it to protect `/app`, redirect authenticated visitors away from public auth flows when appropriate, and keep `/` redirect behavior working.

**10. Auth pages and shell** - Build the `/register` and `/login` pages using the Signal design reference and shared form primitives. The pages should provide inline validation, clear links between auth flows, and stable responsive layouts.

**11. Authenticated app placeholder and logout** - Add the temporary protected `/app` destination and logout action. This gives F02 a complete redirect target while leaving the future library implementation to F04.

## Phase 4: System Integration and Readiness

**12. Focused behavior coverage** - Add the critical backend and frontend coverage described in the spec. Use named fake classes for mocked external I/O and avoid broad UI tests beyond the business-critical auth flows.

**13. Browser navigation pass** - Verify the critical user journeys through the browser using the `playwright-cli` skill after starting services with `./scripts/init.sh`.

**14. Project gates** - Run the detected project gates and resolve failures through the existing scripts and linters. Do not add replacement gate scripts or bypass the backend architecture wrapper.
