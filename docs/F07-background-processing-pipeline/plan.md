# Implementation Plan: Background Processing Pipeline

## Prerequisites

- F02 authentication is implemented and exposes authenticated session resolution for backend routes.
- F03 video upload is implemented; the `videos` table, the `Video` aggregate, and the `validating` initial status are present.
- The project is started and stopped through `./scripts/init.sh` and `./scripts/stop.sh`; app dev servers are not run directly.
- Backend work follows the loaded `clean-arch` skill and preserves the dependency rule.
- An OpenAI account with access to Whisper and GPT-4.1 nano models is available; for tests and local dev the fake-mode (`OPENAI_USE_FAKE=1`) replaces every external call.

## Phase 1: Domain And Schema

**1. Pipeline domain extensions** - Extend the existing video aggregate with stage transitions, attempt accounting, lease semantics, and user-triggered retry, and add a new processing-stage value object so the domain owns the stage vocabulary and ordering.

**2. New pipeline aggregates** - Add the transcription aggregate (with ordered segment value objects and detected-language value object), the video-summary aggregate (overview + key topics), and the processing-attempt aggregate, each in its own feature folder mirrored across the layers.

**3. New gateway interfaces** - Define the audio-extraction, transcription, and summary gateway interfaces in the domain layer so the use cases stay agnostic of OpenAI and FFmpeg.

**4. Persistence schema** - Add a Prisma migration that extends `videos` with the queue / lease / attempt columns and creates the `transcriptions`, `transcription_segments`, `video_summaries`, and `processing_attempts` tables with the constraints described in the spec.

## Phase 2: Use Cases

**5. Stage use cases** - Implement the validate, transcribe, and summarize stage use cases. Each one runs a single stage, persists its output through the new repositories, advances the video, and on failure either schedules the next retry with the PRD backoff or marks the video failed at the end of the retry budget.

**6. Pickup and retry use cases** - Implement the claim-next-processable-video use case (the worker's atomic pickup), the retry-failed-video use case (rewires the F04 endpoint), and the get-video-processing-status use case (the read endpoint that F04 and F11 will consume).

## Phase 3: Infrastructure And Worker Runtime

**7. Repositories, queries, and mappers** - Implement Prisma and in-memory repositories for transcription, video-summary, and processing-attempt, the processing-status read queries, and extend the existing video repository with the claim/lease/due-for-retry methods.

**8. External-service gateways** - Implement the FFmpeg audio-extraction gateway, the OpenAI Whisper transcription gateway with the `verbose_json` response handling, the OpenAI GPT-4.1 nano summary gateway with structured outputs, and the named in-memory fakes for each one used by tests and fake-mode.

**9. Worker runtime** - Implement the pipeline worker (lease + heartbeat + stage dispatch), the worker pool that spawns the configured concurrency, the retry scheduler poller, the structured pipeline logger, and the injected clock that makes time-dependent tests deterministic.

**10. HTTP routes and composition** - Add the processing-status handler, rewire the retry handler through the new use case, register the pipeline routes file, map the new domain errors centrally, extend the env config, and wire every new component plus the worker pool start/stop in `src/main.ts`.

## Phase 4: Integration Readiness

**11. Contract seed and fixtures** - Add `apps/backend/scripts/seed-pipeline-contract.ts` to provision the pipeline contract user and pre-staged videos in each PRD-relevant state, and add the fake-mode response fixtures under `tests/fixtures/background-processing-pipeline/`.

**12. Focused automated coverage** - Add the colocated backend tests for every new domain object, use case, repository, gateway, worker, and route, plus the frontend client-helper tests for the new processing-status response shape.

**13. Browser navigation check** - Use `playwright-cli` against the project started by `./scripts/init.sh` to verify the data-plane behavior of an authenticated user driving a fresh video through every stage and triggering a retry on a seeded failed video.

**14. Project gates** - Run `npm run lint`, `npm run typecheck`, `npm run build`, `npm run test`, and `./scripts/run-gates.mjs`, fixing failures through the provided gates rather than replacing them.
