# Implementation Plan: In-Video Transcription Search

**Prerequisites:**
- F08 (Video Player with Transcription Panel) is implemented and merged: the detail page at `/app/videos/{id}`, the published `<TranscriptionContext>` (`apps/web/lib/transcription-context.tsx`), the rendered `<TranscriptionPanel>`, and the seek controller exposed by `<VideoPlayer>` must all be in place.
- F07 (Background Processing Pipeline) is implemented: every `ready` video must have a persisted transcription whose segments F09 can search against.
- The shared workspace tooling (`./scripts/init.sh`, `./scripts/run-gates.mjs`, `npm run typecheck`, `npm run lint`, `npm run test` for both `apps/web` and `apps/backend`, plus the `playwright-cli` skill) is already configured — F09 introduces no new tooling, no new env var, and no new runtime process.

### Stage 1: Context Extension

**1. Search State on `<TranscriptionContext>`** - Extend the existing client context (`apps/web/lib/transcription-context.tsx`) so it owns the search query, the ordered list of matching segments, the active match index, and the navigation actions (`setQuery`, `goToNextMatch`, `goToPrevMatch`, `clearSearch`) the rest of the F09 surface drives. Recompute the matches whenever the query or the segments change, and bridge each match step into the existing `seekTo` and `registerScrollSuspended(false)` calls so the player and panel react in lockstep.

### Stage 2: Search Surface

**2. Transcription Search Component** - Add `apps/web/components/video/transcription-search.tsx` containing the search input shell, the debounced query commit, the match counter pill, the previous/next chevron buttons, and the keyboard shortcuts (`Enter` advances, `Shift+Enter` steps back, `Escape` clears) when the input is focused. The component reads and writes through the context only — it never owns the matches itself. Render only when the loaded transcription's status is `ready`.

**3. No-Match Message** - Add `apps/web/components/video/no-match-message.tsx` rendering the literal copy "No matches for '{query}'" inside the panel column with the existing panel-aligned typography. The component is purely presentational and consumes the query from the context.

### Stage 3: Panel Integration

**4. Highlight Rendering in `<TranscriptionPanel>`** - Extend `apps/web/components/video/transcription-panel.tsx` so each matched segment's text splits on the lowercased query and wraps every occurrence in a native `<mark>` element styled with the accent token. Add the active-match marker (`data-active-match="true"` plus the left accent border) to the row whose segment index matches the context's active match. Render `<NoMatchMessage>` above the segment list when the query is non-empty and the match list is empty.

**5. Detail Shell Composition** - Extend `apps/web/app/app/videos/[id]/detail-shell.tsx` to mount `<TranscriptionSearch>` directly above `<TranscriptionPanel>` inside the existing right-column container, sharing the same `<TranscriptionContextProvider>` already in scope. The shell change is purely structural — no new prop or state lives at the shell level.

### Stage 4: Verification

**6. Critical Tests and Quality Gate Pass** - Add `apps/web/components/video/transcription-search.test.tsx` covering the substring matching, debounce coalescing, counter values, prev/next wrap, click-on-highlighted segment, clear-restores-list, no-match copy, and keyboard shortcuts behaviors. Extend `apps/web/components/video/transcription-panel.test.tsx` with the highlight-rendering and active-match-marker assertions. Run `npm run typecheck --workspace apps/web`, `npm run lint --workspace apps/web`, `npm test --workspace apps/web`, `npm test --workspace apps/backend`, `./scripts/run-gates.mjs`, and the playwright-cli E2E walkthrough described in the spec; resolve any failure before declaring the feature ready.
