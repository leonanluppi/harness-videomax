# Implementation Plan: Video Library

## Prerequisites

- F02 authentication is implemented and exposes authenticated session resolution for backend routes and web pages.
- F03 video upload is implemented; the existing `videos` table, video aggregate, list query, and `/api/videos` route are present.
- The project is started and stopped through `./scripts/init.sh` and `./scripts/stop.sh`; app dev servers are not run directly.
- Backend work follows the loaded `clean-arch` skill and preserves the dependency rule.
- Frontend work uses Option B "Signal" dark references from `docs/design/design-system-pages/` (notably `components/library.jsx` and `components/library2.jsx`).

## Phase 1: Backend Domain And Schema

**1. Video aggregate operations** - Extend the existing video aggregate with rename, description, and reset-to-validating operations, and add the description value object plus the new domain errors needed for the library actions.

**2. User-preference aggregate** - Add a new user-preference domain folder with the aggregate, library-view-mode value object, repository interface, and queries interface.

**3. Persistence schema** - Add the Prisma model and migration for `user_preferences`, with the FK cascade to users and the view-mode check constraint.

## Phase 2: Backend Use Cases And Routes

**4. Library list extension** - Extend the list-my-videos use case and queries to accept and apply the new sort parameter, with a default and a tolerant fallback for unknown values.

**5. Video update and delete use cases** - Implement rename, update-description, delete, and retry use cases with ownership checks and the partial filesystem-cleanup tolerance described in the spec.

**6. Preferences use cases** - Implement get-my-preferences (with the default-when-absent contract) and update-library-view-mode (upsert).

**7. HTTP video routes** - Add PATCH, DELETE, and retry handlers, register them on the existing video routes file, map the new domain errors centrally, and wire the new handlers in `src/main.ts`.

**8. HTTP preferences routes** - Add a new preferences routes file with GET and PATCH handlers, register the new routes file in `infra/http/index.ts`, and wire the new components in `src/main.ts`.

## Phase 3: Frontend Library Experience

**9. Library shell and data flow** - Replace the F03 minimal list at `/app` with the full library view, fetch videos and preferences during the server render, and apply the persisted view mode.

**10. Grid, list, and empty states** - Implement the grid view, list view, status badge, and empty-library components using the design references.

**11. Per-card actions and dialogs** - Implement the card menu, rename dialog, edit-description dialog, and delete-confirmation dialog including the 1-second confirm guard and the concurrent-delete error path.

**12. View-mode toggle and sort control** - Implement the toggle and the sort selector, wire optimistic UI for the toggle with revert-on-failure, and refetch the list when the sort changes.

**13. Proxy routes and API helpers** - Add Next.js Route Handlers for `/api/videos/[id]`, `/api/videos/[id]/retry`, and `/api/users/me/preferences`; add and extend the typed API helpers for the new operations.

## Phase 4: Integration Readiness

**14. Contract seed and fixtures** - Add `apps/backend/scripts/seed-video-library-contract.ts` to provision `library-user`, `other-user`, the contract videos in the required statuses, and the supporting on-disk artifacts at the project's fixture path.

**15. Focused automated coverage** - Add colocated backend tests for every new use case, repository, and route, plus the critical frontend tests for empty state, toggle persistence, dialog flows, and the rename/delete/retry paths.

**16. Browser navigation check** - Use `playwright-cli` against the project started by `./scripts/init.sh` to verify grid/list rendering, view-mode persistence across reload, rename/delete/retry flows, and the empty-library state.

**17. Project gates** - Run `npm run lint`, `npm run typecheck`, `npm run build`, `npm run test`, and `./scripts/run-gates.mjs`, fixing failures through the provided gates rather than replacing them.
