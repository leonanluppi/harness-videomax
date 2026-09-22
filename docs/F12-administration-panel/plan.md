# Implementation Plan: Administration Panel

## Prerequisites

- F02 authentication is implemented and exposes `is_admin`, `status`, and authenticated session resolution for backend routes and web pages.
- F03 video upload is implemented; the existing `videos` table, video aggregate, and `videos.user_id → users.id` cascade FK are present.
- The project is started and stopped through `./scripts/init.sh` and `./scripts/stop.sh`; app dev servers are not run directly.
- Backend work follows the loaded `clean-arch` skill and preserves the dependency rule.
- Frontend work uses Option B "Signal" dark references from `docs/design/design-system-pages/`.

## Phase 1: Backend Domain And Authorization Helper

**1. User aggregate suspension transitions** - Extend the existing `User` entity with `suspend()` and `reactivate()` operations consistent with the existing factory pattern, and add the new domain errors needed by the admin guardrails.

**2. Admin queries interface and authorization helper** - Add a new `domain/admin/admin.queries.ts` interface declaring the metrics, list-users, find-user-summary, and count-admins read models, and a small `usecase/admin/admin-authorization.ts` helper that throws when the actor lacks the admin flag.

## Phase 2: Backend Use Cases And Cascade Invariant

**3. Admin metrics and user list use cases** - Implement the metrics and the paginated user list use cases, applying the search, sort, and pagination defaults described in the spec, and reuse the project's `PageInput`/`PageOutput<T>` shape.

**4. Suspend, reactivate, and delete use cases** - Implement the three mutating use cases with the self-action and last-admin guardrails enforced inside the same transaction as the persistence write, and (for suspend) revoke the target user's sessions atomically.

**5. Suspended-user login defenses** - Update the login and current-session use cases so a suspended user cannot log in with valid credentials and so a session that survives an in-flight suspension is treated as anonymous on its next request.

**6. Cascade invariant test** - Add a colocated test that parses `prisma/schema.prisma` and asserts every model with a `userId` field declares `onDelete: Cascade` on its FK, so future user-owned tables inherit the delete cascade automatically.

## Phase 3: Backend HTTP And Composition

**7. Admin-only middleware and admin queries adapter** - Add the admin-only HTTP middleware that returns 404 for anonymous and non-admin requests, and the Prisma + in-memory implementations of the admin queries.

**8. Admin handlers and routes** - Add metrics, list-users, suspend, reactivate, and delete handlers, group them in a new admin routes file behind the admin-only middleware, register the routes in `infra/http/index.ts`, and wire the new handlers and dependencies in `src/main.ts`.

## Phase 4: Frontend Admin Area

**9. Admin guard, layout, and dashboard** - Add the server-side admin guard helper that turns a non-admin or anonymous session into `notFound()`, the admin layout with top navigation, and the dashboard page that renders the two metric cards.

**10. Users page, table, and search** - Implement the users list page with the search input, sortable column headers, pagination controls, and the per-row context menu that exposes the action dialogs.

**11. Action dialogs** - Implement the suspend, reactivate, and delete dialogs, including the typed-email-must-match guard and the one-second post-open delete guard.

**12. Proxy routes and API helpers** - Add Next.js Route Handlers for `/api/admin/metrics`, `/api/admin/users`, `/api/admin/users/[id]`, `/api/admin/users/[id]/suspend`, and `/api/admin/users/[id]/reactivate`, plus the typed browser API helpers.

## Phase 5: Bootstrap And Integration Readiness

**13. Bootstrap CLI and contract seed** - Add `apps/backend/scripts/promote-admin.ts` for creating the first admin and `apps/backend/scripts/seed-admin-contract.ts` to provision the admin, regular, suspended, and pagination-filler users plus the videos required by the contract.

**14. Focused automated coverage** - Add the colocated backend tests for every new use case, query, middleware, and route, plus the critical frontend tests for the admin guard, table, and the typed-email-confirmation dialog.

**15. Browser navigation check** - Use `playwright-cli` against the project started by `./scripts/init.sh` to verify the metrics dashboard, the search/sort/pagination flow, suspend/reactivate, the typed-email-confirmed delete cascade, and the non-admin 404 behavior on `/admin/*`.

**16. Project gates** - Run `npm run lint`, `npm run typecheck`, `npm run build`, `npm run test`, and `./scripts/run-gates.mjs`, fixing failures through the provided gates rather than replacing them.
