# Implementation Plan: AI Summary Display

**Prerequisites:**
- Backend tooling already configured (Node 20+, TypeScript strict, Prisma 5, Vitest, Fastify) per `apps/backend/package.json`.
- Frontend tooling already configured (Next.js 16 App Router, React 19, Vitest, Tailwind v4) per `apps/web/package.json`.
- F07 (Background Processing Pipeline) implemented — the `VideoSummary` table, the `RunSummarizeStageUseCase`, and the `VideoSummaryRepository` are already in place.
- F08 (Video Player with Transcription Panel) implemented — the detail page and the `<SummarySlot>` placeholder already exist.
- Local environment started via `./scripts/init.sh` before exercising the contract; teardown via `./scripts/stop.sh --clean`.

### Stage 1: Backend summary endpoint

**1. Get-Video-Summary Use Case** — Create the read-only orchestration that resolves the requested video, enforces ownership, loads the persisted `VideoSummary` row through the existing repository port, and composes the status-aware DTO. Reference the spec for the four observable outcomes and the field shape.

**2. Summary HTTP Handler and Route** — Add the Zod-validated handler that wires the use case to a `GET /api/videos/:id/summary` route, register it through `videoRoutes()`, and instantiate it in the composition root alongside the existing transcription and stream wiring. Reference the spec for the auth pattern, the Zod schema, and the dependency injection shape.

**3. Backend Tests** — Cover the use case (four observable outcomes) and the handler (success, unauthenticated, validation failure) with Vitest specs that follow the project's named-fake convention. Add a `seed-ai-summary-display-contract.ts` script under `apps/backend/scripts/` that produces the persistent state declared in the contract.

### Stage 2: Frontend summary client and proxy

**4. Next.js Route Handler Proxy** — Add the `apps/web/app/api/videos/[id]/summary/route.ts` proxy that forwards `GET /api/videos/{id}/summary` to the backend, preserving the request cookie and the response status, body, and content type. Mirror the existing `transcription/route.ts` proxy.

**5. Web API Client** — Extend `apps/web/lib/videos-api.ts` with a `getVideoSummary(videoId, cookie?)` function (server overload accepts the cookie header from `next/headers`, client overload omits it) plus a JSON shape guard. Reference the spec for the response shape.

### Stage 3: Render the summary inside the detail page

**6. VideoSummary Component** — Build the new client component that renders the Overview paragraph and the Key topics bulleted list when content is present, the failure callout when `status === "failed"` and no summary exists, and `null` while the summarize stage is still running. Apply the dark **B · Signal** tokens documented in the spec's visual fidelity notes.

**7. Detail Page Wiring** — Update `apps/web/app/app/videos/[id]/page.tsx` to fetch the summary alongside the video list and transcription via `Promise.all`, then update `detail-shell.tsx` to accept the `summary` prop and render `<SummarySlot><VideoSummary summary={summary} /></SummarySlot>`. The `<SummarySlot>` placeholder remains the layout anchor.

**8. Frontend Tests** — Add `video-summary.test.tsx` covering the four UI states. Add the playwright-cli E2E scenarios documented in the spec (ready video shows the rendered summary; permanently-failed video shows the failure copy). Run `./scripts/run-gates.mjs` and the workspace test scripts before declaring the feature done.
