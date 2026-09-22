# Implementation Plan: Video Upload

## Prerequisites

- F02 authentication is implemented and exposes authenticated session resolution for backend routes and web pages.
- The project is started and stopped through `./scripts/init.sh` and `./scripts/stop.sh`; app dev servers are not run directly.
- Backend work follows the loaded `clean-arch` skill and preserves the dependency rule.
- Frontend work uses Option B "Signal" dark references from `docs/design/design-system-pages/`.

## Phase 1: Backend Upload Foundation

**1. Video domain model** - Add the video aggregate, value objects, repository and query interfaces, gateway interfaces, and domain errors needed to represent an uploaded video and its local media assets.

**2. Persistence schema** - Add the Prisma video model and migration for owned video metadata, local storage paths, duration, thumbnail state, status, failure reason, and upload timestamps.

**3. Storage and media adapters** - Add filesystem storage and FFmpeg/ffprobe adapters in infra, plus named fake implementations for tests. Keep all runtime configuration in `apps/backend/src/config/env.ts`.

## Phase 2: Backend Use Cases And Routes

**4. Upload use case** - Implement upload orchestration that validates ownership, stores the file, records metadata, probes duration, extracts the thumbnail, handles fallback thumbnail state, and persists the final upload result.

**5. Minimal list use case** - Implement an authenticated list query for the current user's uploaded videos so F03 can show newly uploaded content before F04 expands the library.

**6. HTTP routes** - Add authenticated video upload and list handlers, register the Fastify multipart support, map upload errors centrally, and wire concrete classes in `src/main.ts`.

## Phase 3: Frontend Upload Experience

**7. App shell update** - Replace the temporary F02 `/app` placeholder with the minimal library/upload surface using the design-system Option B Signal references.

**8. Upload interaction** - Add the drop zone, file picker, client-side validation, one-at-a-time queue, progress card, retry state for interrupted uploads, and accessible toast region.

**9. Video list rendering** - Add the minimal owned-video list with thumbnail/placeholder, derived title, file metadata, upload timestamp, and status badge.

**10. Proxy routes and API helpers** - Add Next.js Route Handlers for video list and upload proxying, plus typed frontend helpers for video responses and upload queue state.

## Phase 4: Integration Readiness

**11. Focused automated coverage** - Add colocated backend tests for every new function and named fake, plus critical frontend tests for validation, queueing, progress display, and uploaded-video rendering.

**12. Browser navigation check** - Use `playwright-cli` against the project started by `./scripts/init.sh` to verify the authenticated `/app` upload flow and pre-transfer rejection behaviors.

**13. Project gates** - Run `npm run lint`, `npm run typecheck`, `npm run build`, `npm run test`, and `./scripts/run-gates.mjs`, fixing failures through the provided gates rather than replacing them.
