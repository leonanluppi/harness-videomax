# Implementation Plan: In-App Processing Notifications

## Prerequisites

- F02 authentication is implemented and exposes authenticated session resolution for backend routes and web pages.
- F03 video upload is implemented; the existing `videos` table, video aggregate, list query, and `/api/videos/upload` route are present, and the browser-side `UploadQueueModel` exposes per-item status and progress.
- F07 background processing pipeline is implemented; `videos.status`, `videos.current_stage`, `videos.failure_reason`, and `videos.updated_at` already advance through `validating → transcribing → summarizing → ready/failed` per its contract.
- The project is started and stopped through `./scripts/init.sh` and `./scripts/stop.sh`; app dev servers are not run directly.
- Backend work follows the loaded `clean-arch` skill and preserves the dependency rule.
- Frontend work uses Option B "Signal" dark references from `docs/design/design-system-pages/`, notably `components/notif.jsx`.

## Phase 1: Backend Notification Feed

**1. Notification feed query interface** - Add a domain-side query interface for the per-user notification feed (active processing videos plus terminals from the last 60 minutes) and extend the in-memory and Prisma video query implementations to honor the same filter and time window.

**2. Notification feed use case** - Add the `ListNotificationFeedUseCase` and its DTO under `usecase/video/`, wire it through the new query interface, and cover the active-set, terminal-window, per-user isolation, and empty-feed paths with colocated tests.

**3. Notification feed HTTP route** - Add the new handler under `infra/http/video/`, register `GET /api/videos/notifications` on the existing video routes file, wire the handler in `src/main.ts`, and extend the route tests for the 200 happy path, the 401 unauthenticated path, and the per-user isolation case.

## Phase 2: Web Proxy and Browser Feed Model

**4. Web proxy Route Handler** - Add `apps/web/app/api/videos/notifications/route.ts` that forwards `GET` requests to the backend, preserving the authenticated `session_token` cookie and the JSON response body.

**5. Browser feed client and merge model** - Add the `notifications-api`, `notifications-feed`, and `notifications-session` modules under `apps/web/lib/`: type the wire format, expose `fetchNotificationFeed()`, build the merge model that combines the F03 upload queue with the server-side feed entries by video id, sort by recency, and apply session-scoped dismissal and auto-expand state through `sessionStorage` with safe SSR guards.

**6. Polling driver** - Add `notifications-poller` that drives the merge model on a 3-second interval, pauses on `visibilitychange` (tab hidden), resumes on visible, and stops cleanly when the panel unmounts.

## Phase 3: Notification Panel UI

**7. Notification panel components** - Add `NotificationPanel`, `NotificationEntry`, and `NotificationToggle` under `apps/web/components/notifications/`, following the `notif.jsx` design reference: bottom-right anchored panel with the "Processing" header, the active-count badge, the per-entry rows (thumbnail/title/stage/progress/failure reason/dismiss), the empty-state collapsed bell-icon toggle, and the navigation handler that opens `/app/videos/{id}`.

**8. App shell integration** - Mount the `NotificationPanel` once inside `apps/web/components/app/app-shell.tsx` so it persists across `/app/*` and `/admin/*` route changes; ensure no duplicate mounts on unauthenticated pages.

**9. Component tests** - Add the colocated frontend tests for the panel (active-count, dismiss restriction, empty-state collapse, auto-expand on first upload, click-to-detail navigation) and the merge model (dedup, recency sort, dismissal filter).

## Phase 4: Integration Readiness

**10. Contract seed and fixtures** - Add `apps/backend/scripts/seed-in-app-processing-notifications-contract.ts` to provision `notif-user`, `other-notif-user`, and a fixed set of videos covering each active processing state, recent terminals (within 60 minutes), and an old terminal (older than 60 minutes) that must NOT appear in the feed; place the supporting fixture files under `tests/fixtures/in-app-processing-notifications/`.

**11. Browser navigation check** - Use `playwright-cli` against the project started by `./scripts/init.sh` to verify the panel renders in the bottom-right on `/app`, the active-count badge updates, dismiss hides terminal entries for the session, the panel persists across route changes, and clicking an entry navigates to `/app/videos/{id}`.

**12. Project gates** - Run `npm run lint`, `npm run typecheck`, `npm run build`, `npm run test`, and `./scripts/run-gates.mjs`, fixing failures through the provided gates rather than replacing them.
