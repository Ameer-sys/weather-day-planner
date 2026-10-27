# Codex handoff — ATMOS Weather Intelligence v2

## Implementation update

The current release uses public GitHub repository `Ameer-sys/weather-day-planner` for source control and Vercel project `weather-day-planner` for hosting. Product branding is **ATMOS — Your Weather & Outdoor Planning Dashboard**. See `RELEASE.md` for verified publication/deployment status. GitHub Pages is not configured. `guidance.js` supplies the plain-language recommendation, reason, best-time and precautions shown by ATMOS Intelligence without a paid AI service.

The original sections below describe the supplied v2 baseline. Completed refinement and current verification are in `VERIFICATION.md`; release instructions are in `DEPLOYMENT.md`. Keep the vanilla architecture: `weather.js` now owns tested normalization/assessment logic, `backend.mjs` owns the shared secure HTTP handler, and `server.mjs` is the local entry point. `api/*.mjs` adapt the handler for Vercel. No Next.js migration is needed for the present scope.

## Goal

Continue the existing `ATMOS` weather dashboard project in this directory. **Do not create a different-looking site or throw away the functional interface.**

This app was tailored to a user-uploaded reference screenshot stored at `assets/ui-reference.png`.

The UI reference is a sophisticated blue-on-navy financial analytics dashboard. ATMOS translates its dense analytics dashboard structure into a **weather-monitoring SOC**:

- 238px slim left sidebar with clear active navigation
- navy gradient backdrop and nearly-black dark cards
- 4 compact status tiles at the top
- a large, luminous visual focal-point card
- circular gauge and recommendation card on the right
- broad blue forecast graph with secondary bar graphs
- detailed watchlist / AI advice cards at the bottom
- clean 11–12px dashboard labels and electric cyan accents

## v2 visuals implemented

The v2 iteration adds the CSS/SVG plasma weather artwork, adaptive weather particles, keyboard-accessible precipitation chart inspector, forecast signal ribbon, richer page transitions and glow treatments, motion toggle, improved mobile grid, and `prefers-reduced-motion` behavior. The visuals follow the reference screenshot in `assets/ui-reference.png`.

When iterating, preserve animated hero layers and the explicit rule that the weather art is decorative, not a live radar image. Keep the atmosphere responsive to condition codes and respect selected location coordinates.

## What already works

Review `README.md` first. This repository is a dependency-free HTML, CSS, JS and Node application with Open-Meteo live forecast proxy, date/activity planner, hourly charts, location search, saved watchlist, forecast comparisons and optional OpenAI Responses API.

## Priority work after import

1. Run `npm run check`, `npm test`, and `npm run dev`. Inspect the UI at 1440px and mobile breakpoints. Fix issues rather than rewriting components unnecessarily.
2. Test real Open-Meteo data against Hamilton, Ontario, and verify date/timezone handling, API errors, and source attribution. Don't replace failed API calls with unlabeled random data.
3. Polish the visuals using the reference image: denser typography, glowing blue depth, nuanced shadows, coherent line charts, and animated hero. Match the **composition and aesthetic**, not text/data from the reference.
4. Migrate to Next.js App Router + TypeScript + Tailwind/shadcn/ui only if that helps the implementation; preserve the overall visual treatment and existing functionality. Keep sensitive API routes server-side.
5. Add automated unit tests around day/hour filtering, threshold boundaries, forecast-change logic, and daylight-saving shifts.
6. Improve watchlist lifecycle: watch all stored locations, persist server-side if user auth added, allow per-activity risk preferences, and add scheduled server-side alerts with opt-in and unsubscribe.
7. Extend weather intelligence: confidence/uncertainty, responsible trail safety recommendations, location coordinates for trailheads, and forecast source metadata.
8. Optionally add email/push alerts, production deployment, database storage, and better accessibility/performance if requested.

## Weather accuracy constraints

- Distinguish **probability** from **amount** and **current conditions** from **future forecast**.
- Avoid claiming that polling every 5 minutes means models refresh every 5 minutes.
- Only claim data are live if an actual API response was successfully fetched.
- A readiness score is heuristic, never a safety guarantee.
- Official warnings and trail advisories are not yet integrated. Do not claim otherwise.
- Never expose OpenAI keys to the browser.

## User's planned Thursday watch

Hamilton, Ontario, Canada. October 29, 2026. Waterfall hike & picnic, approx 10 AM–6 PM local time (tentative). Keep this as an editable example, not an immutable event.

## Suggested Codex instruction

> You are continuing an existing app, ATMOS. Read `README.md`, `CODEX_HANDOFF.md`, and inspect `assets/ui-reference.png`. Launch the app and screenshot its current responsive layout. Keep the visual identity almost exactly the same: deep midnight-blue command-centre interface, large animated weather hero, luminous blue charts, compact tiles, and rounded analytical panels. Validate real Open-Meteo data end to end and solve any bugs you find. Improve production readiness incrementally; do not discard any working pages. Finish with a summary of verified features, tests, and launch steps.
