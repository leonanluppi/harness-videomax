# Implementation Plan: Landing Page

## Prerequisites

- Review `docs/design/design-system-pages/components/landing.jsx`, `components/tokens.jsx`, `components/ui.jsx`, and `components/footer.jsx` before writing UI code.
- Start local services through `./scripts/init.sh` only when browser verification is needed.
- Keep F02-owned authentication internals behind the web session helper.

## Phase 1: Root Route and Session Boundary

**1. Session boundary** - Add `apps/web/lib/session.ts` with an explicitly typed `getCurrentSession()` function that returns authenticated state without exposing auth internals to the landing route.

**2. Root page** - Replace the scaffolded backend hello call in `apps/web/app/page.tsx` with server-side session handling and public landing rendering. The route redirects to `/app` when the session boundary reports an authenticated visitor.

**3. App metadata** - Update `apps/web/app/layout.tsx` so document metadata reflects Videomax instead of the scaffolded Next.js defaults.

## Phase 2: Landing UI

**4. Marketing components** - Build the landing composition as small components under `apps/web/components/marketing/`, following the structure from the design-system landing page.

**5. Shared CTA primitive** - Add a typed link-button component for the primary CTA and secondary navigation actions, with accessible focus states and stable dimensions.

**6. Global styling** - Update `apps/web/app/globals.css` with Videomax tokens, neutral page colors, restrained accent usage, responsive layout helpers, and typography rules that avoid negative letter spacing.

## Phase 3: Verification

**7. Critical tests** - Add focused tests for anonymous rendering, authenticated redirect branching, CTA hrefs, login link hrefs, and visible page landmarks.

**8. Browser navigation check** - Use `playwright-cli` for a critical navigation pass over `/`, the create-account link, the login link, and the authenticated redirect path once session support is available.

**9. Quality gates** - Run the detected project gates and resolve any failures without adding replacement gate scripts.
