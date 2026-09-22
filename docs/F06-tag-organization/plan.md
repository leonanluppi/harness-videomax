# Implementation Plan: Tag Organization

## Prerequisites

- F02 authentication is implemented and exposes authenticated session resolution for backend routes and web pages.
- F03 video upload is implemented; the `videos` table, video aggregate, and video persistence are present.
- F04 video library is implemented; the library page, the list-my-videos query, and the existing PATCH/DELETE/retry video routes are present.
- The project is started and stopped through `./scripts/init.sh` and `./scripts/stop.sh`; app dev servers are not run directly.
- Backend work follows the loaded `clean-arch` skill and preserves the dependency rule.
- Frontend work uses Option B "Signal" dark references from `docs/design/design-system-pages/`.

## Phase 1: Backend Domain And Schema

**1. Tag aggregate** - Add a new tag domain folder with the tag aggregate, the tag-name value object enforcing the lowercase 1-40 / hyphen rule, the tag-id value object, and the tag domain errors covering invalid name, not found, already exists, and the per-video cap.

**2. Tag repository, queries, and join interfaces** - Define the tag write repository, the tag read queries (with usage count), and the video-tag join repository that replaces a video's tag set atomically.

**3. Persistence schema** - Add the Prisma models and migration for `tags` and `video_tags`, including the `(user_id, name)` uniqueness, the canonical-name CHECK constraint, and the cascading foreign keys to users and videos.

## Phase 2: Backend Use Cases And Routes

**4. Tag CRUD use cases** - Implement create-tag, list-my-tags (with usage count), rename-tag, and delete-tag use cases with ownership checks and the duplicate-name and canonical-name guarantees described in the spec.

**5. Apply tags to video use case** - Implement the set-video-tags use case that resolves existing tag ids and inline-creates from the new-name bucket, enforces the 0-20 resolved-set cap, and replaces the join table contents atomically.

**6. Library list extension** - Extend the list-my-videos use case and queries to accept a `tagIds` OR filter and a `folderId` AND filter, including the F06 test-only override that lets the contract drive a synthetic folder filter without F05 being implemented.

**7. HTTP tag routes** - Add the GET, POST, PATCH, DELETE handlers for `/api/tags`, the PUT handler for `/api/videos/{id}/tags`, register them on a new tag routes file, map the new domain errors centrally, and wire the new components in `src/main.ts`.

**8. HTTP video list extension** - Update the list-my-videos handler to parse and forward the `tags` and `folderId` query parameters; register no new routes (the existing route gets the new params).

## Phase 3: Frontend Tag Experience

**9. Tag-aware library shell** - Mount the tag filter pill row inside the library view, forward selected tag ids and the current folder hint into the list fetch, and reflect the selection state in the URL or session for reload-stability as appropriate to the design.

**10. Card tag pills** - Render up to three tag pills inline on the grid card and the list row, collapse extras into a `+N` indicator, and reuse the same pill primitive across both views.

**11. Edit tags dialog and combobox** - Build the reusable tag combobox with substring suggestions and an inline "Create tag '{name}'" affordance, the edit-tags dialog launched from the per-card menu, and surface the 20-tag cap and the server validation errors inline.

**12. Manage tags page** - Build the `/app/tags` route with the manage list, the rename dialog, and the delete dialog including the "removed from N videos" confirmation copy.

**13. Proxy routes and API helpers** - Add Next.js Route Handlers for `/api/tags`, `/api/tags/[id]`, and `/api/videos/[id]/tags`; extend the existing `/api/videos` proxy with the `tags` and `folderId` query parameters; add typed API helpers for every new operation.

## Phase 4: Integration Readiness

**14. Contract seed** - Add `apps/backend/scripts/seed-tag-contract.ts` to provision `tag-user`, `other-tag-user`, the seeded tags, the seeded videos, and the deterministic `tagIds` x `videoId` association map the contract relies on.

**15. Focused automated coverage** - Add colocated backend tests for every new use case, repository, queries, and route, plus the critical frontend tests for the filter pill row, the edit-tags dialog, the tag combobox, and the manage list.

**16. Browser navigation check** - Use `playwright-cli` against the project started by `./scripts/init.sh` to verify tag pill rendering on cards, the filter pill row OR semantics, edit-tags create-and-attach, and the manage view rename and delete flows.

**17. Project gates** - Run `npm run lint`, `npm run typecheck`, `npm run build`, `npm run test`, and `./scripts/run-gates.mjs`, fixing failures through the provided gates rather than replacing them.
