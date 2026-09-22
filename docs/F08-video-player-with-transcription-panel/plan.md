# Implementation Plan: Video Player with Transcription Panel

**Prerequisites:**
- Node.js per the workspace `engines` field; npm workspaces are already configured.
- F03 (video upload, file storage, ownership) and F07 (transcription persistence, processing status) must be implemented and migrated; F02 (auth + session cookie) must be available transitively.
- `apps/backend/.env` must contain the existing variables read through `apps/backend/src/config/env.ts`; no new variables are introduced by F08.
- The web and backend apps share the existing `./scripts/init.sh` start path — F08 introduces no new runtime processes.

### Stage 1: Backend Read Surfaces

**1. Get-Video-Transcription Use Case** - Add a use case under `apps/backend/src/usecase/video/` that resolves the actor's ownership of the requested video, loads the persisted transcription via the F07 `TranscriptionRepository`, and combines the result with the video's current processing status / stage so the page can render the correct branch (segments + language for `ready`, processing placeholder otherwise). Pair the use case with its DTO and a colocated `*.spec.ts` covering the happy path, still-processing, partial-success failed, and foreign-user 404 cases.

**2. Stream-Video Use Case** - Add a use case under `apps/backend/src/usecase/video/` that resolves the actor's ownership of the requested video and produces a stream descriptor (`totalSize`, `contentType`, and a `openRange(start, end)` factory) backed by the F03 `LocalVideoStorage` gateway interface. Cover ownership rejection and missing-file error mapping in the colocated test.

**3. Transcription HTTP Surface** - Add a handler under `apps/backend/src/infra/http/video/` that authenticates the request, parses the `:id` path parameter, calls the use case, and returns the JSON shape declared in the spec. Register the route through `video.routes.ts` so it inherits the existing video-route prefix and the session middleware.

**4. Video Stream HTTP Surface** - Add a handler under `apps/backend/src/infra/http/media/` that authenticates the request, parses the inbound `Range` header (single-range only), and pipes either the full file (`200`) or the requested slice (`206`) with the documented `Accept-Ranges` / `Content-Range` / `Content-Type` headers; return `416` on malformed or multi-range requests. Register the route through `media.routes.ts` next to the existing thumbnail route.

**5. Composition Root Wiring** - Modify `apps/backend/src/main.ts` to instantiate the two new use cases, the two new handlers, and pass them into `buildHttpRoutes`. Modify `apps/backend/src/infra/http/error-handler.ts` to map any new errors raised by the stream use case (e.g., a missing-on-disk video file) to the appropriate HTTP response.

### Stage 2: Frontend Detail Page

**6. Web Proxy Routes** - Add Next.js Route Handlers under `apps/web/app/api/videos/[id]/transcription/route.ts` and `apps/web/app/media/videos/[id]/route.ts` that forward the inbound cookie (and, for the stream proxy, the `Range` header) to the backend and stream the response back with status, body, and the relevant headers preserved. Match the shape of the existing `apps/web/app/media/thumbnails/[filename]/route.ts`.

**7. API Client Helpers** - Extend `apps/web/lib/videos-api.ts` with the `VideoTranscription` type and a `getVideoTranscription(videoId, cookie?)` helper used by the server component to load the transcription on first paint.

**8. Transcription Context** - Add `apps/web/lib/transcription-context.tsx` exporting the typed React context (`segments`, `currentSegmentIndex`, `detectedLanguage`, `seekTo`, `registerScrollSuspended`) plus a `useTranscriptionContext()` hook. This is the published surface F09 will plug into; document the exported shape inline.

**9. Detail Page Layout** - Add the Next.js segment under `apps/web/app/app/videos/[id]/` (`page.tsx`, `loading.tsx`, `not-found.tsx`). The server component fetches the transcription on the server (using the request cookie), then renders the three-region layout (player + panel + summary slot) inside a `<TranscriptionContextProvider>`. The page hands the player and panel the data they need without importing each other.

### Stage 3: Player and Transcription Panel

**10. Video Player Component** - Add `apps/web/components/video/video-player.tsx` (and `video-player-controls.tsx`) wrapping the native `<video>` element. Implement the play / pause / seek bar / volume / fullscreen / playback-speed menu controls; emit `timeupdate` into the context; handle space + arrow-key shortcuts gated by player focus. Add the colocated critical tests covering the focus-gated shortcuts, the speed menu, and the context updates.

**11. Transcription Panel Component** - Add `apps/web/components/video/transcription-panel.tsx` rendering the segment list with `MM:SS` start times and segment text. Wire click-to-seek through the context, the current-segment highlight subscription, the auto-scroll mechanism (`scrollIntoView({ block: "center", behavior: "smooth" })`), and the manual-scroll suspend / resume rule. Add the colocated critical tests covering the click-to-seek, highlight, auto-scroll, and suspend / resume behaviors.

**12. Supporting Components** - Add `processing-placeholder.tsx` (renders the literal "Transcription will appear here when processing completes" copy plus the current stage), `language-label.tsx` (small uppercase label rendered when `detectedLanguage` is non-null), `summary-slot.tsx` (empty `<section data-slot="summary">` reserved for F10), and `detail-header.tsx` (composes the existing F04 rename / describe / delete dialogs and shows the F07 retry button only when `status === "failed"`).

### Stage 4: Contract Seed and Verification

**13. Contract Seed Script** - Add `apps/backend/scripts/seed-video-player-contract.ts` provisioning the contract users (`player-user`, `other-player-user`), the seeded videos (`ready-player-video` with persisted transcription + detected language, `processing-player-video` in `transcribing`, `failed-player-video` in `failed`, `foreign-player-video` for the other user, `silent-ready-player-video` with `ready` status and zero segments). Add the corresponding npm script `seed:video-player-contract` to `apps/backend/package.json`.

**14. Static Fixtures** - Place the static fixtures `sample-ready.mp4` and `transcription-segments.json` under `tests/fixtures/video-player-transcription-panel/` matching the canonical Whisper response shape consumed by the seed script.

**15. Quality Gate Pass** - Run `npm run lint`, `npm run typecheck`, `npm run build`, `npm run test`, and `./scripts/run-gates.mjs` from the workspace root. Resolve any failures before declaring the feature ready.
