# Implementation Plan: Folder Organization

## Prerequisites

- F02 authentication is implemented and exposes authenticated session resolution for backend routes and web pages.
- F03 video upload is implemented; the existing `videos` table, video aggregate, and `/api/videos` upload route are present.
- F04 video library is implemented; the library shell at `/app`, the video card menu, the list videos query, and `PATCH /api/videos/{id}` are present.
- The project is started and stopped through `./scripts/init.sh` and `./scripts/stop.sh`; app dev servers are not run directly.
- Backend work follows the loaded `clean-arch` skill and preserves the dependency rule (`domain/` <- `usecase/` <- `infra/`).
- Frontend work uses Option B "Signal" dark references from `docs/design/design-system-pages/`, including the folder sidebar and "Move to folder" affordances visible in `components/library2.jsx`.

## Phase 1: Backend Domain And Schema

**1. Folder aggregate** - Add a new `folder` domain folder with the entity, the folder-id and folder-name value objects, the repository interface, the queries interface, and the new domain errors aligned with the existing video-error pattern.

**2. Video aggregate extension** - Extend the existing video aggregate with the optional `folderId` field and the `assignToFolder` operation, and update the video repository / queries interfaces so persistence and reads honor the folder relationship.

**3. Persistence schema** - Add the Prisma model and migration for `folders` (per-user case-insensitive unique name, FK cascade to users, length check) and the `videos.folder_id` nullable foreign key with `ON DELETE SET NULL` plus the per-user / per-folder / `uploadedAt` index.

## Phase 2: Backend Use Cases And Routes

**4. Folder use cases** - Implement create, list (with per-folder video count), rename, and delete use cases, with ownership checks and the atomic unfile-then-delete in the delete path.

**5. Video assignment use case** - Implement the assign-video-to-folder use case that handles both assignment and unfile (`folderId: null`), validating ownership of both the video and (when not null) the folder.

**6. Library list extension** - Extend the existing list-my-videos use case and queries to apply the folder filter (`any` / specific folder / `unfiled`) alongside the existing sort, and add the F05-internal `tagId` pass-through that is no-op until F06 ships its `video_tags` table.

**7. HTTP folder routes** - Add the GET / POST / PATCH / DELETE handlers, register them on a new folder routes file, include the file in `infra/http/index.ts`, map the new domain errors centrally, and wire the new components in `src/main.ts`.

**8. HTTP video extensions** - Extend the existing update-video handler to accept `{ folderId }` alongside `title` and `description`, and extend the list-my-videos handler to parse the new `folderId` and `tagId` query parameters.

## Phase 3: Frontend Folder Experience

**9. Folder API helpers and proxies** - Add `apps/web/lib/folders-api.ts`, the Next.js Route Handlers at `apps/web/app/api/folders/route.ts` and `apps/web/app/api/folders/[id]/route.ts`, and extend the existing video proxy + helpers for the new `folderId` body field and the new `folderId` / `tagId` query parameters.

**10. Library shell with sidebar** - Update `apps/web/app/app/page.tsx` to fetch folders alongside videos and preferences, parse the `?folder=` query parameter, and pass the resolved selection to the library view; mount the new sidebar inside the existing app shell.

**11. Folder sidebar and inline editing** - Implement the sidebar container, the per-row component, the inline create input, the inline rename input, and the delete confirmation modal with the PRD-mandated copy.

**12. Move-to-folder card affordance** - Extend the existing F04 card menu with a "Move to folder" item, implement the move-to-folder combobox dialog with an inline "Create new folder" option, and surface the duplicate-name error inline.

## Phase 4: Integration Readiness

**13. Contract seed and fixtures** - Add `apps/backend/scripts/seed-folder-organization-contract.ts` to provision `folder-user`, `other-user`, the deterministic folder set, and the deterministic video set inside / outside folders, reusing the existing `tests/fixtures/video-library/` placeholder files where needed.

**14. Focused automated coverage** - Add colocated backend tests for every new domain object, use case, repository, query, and route; add the frontend tests for the sidebar render order, URL synchronization, and the move-to-folder dialog flows.

**15. Browser navigation check** - Use `playwright-cli` against the project started by `./scripts/init.sh` to verify the sidebar render order, folder selection updating the URL and the library, the inline create / rename / delete flows, and the "Move to folder" assignment + unfile-on-folder-delete paths.

**16. Project gates** - Run `npm run lint`, `npm run typecheck`, `npm run build`, `npm run test`, and `./scripts/run-gates.mjs`, fixing failures through the provided gates rather than replacing them.
