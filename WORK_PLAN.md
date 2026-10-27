# ATMOS v2 delivery plan

Preserve the supplied dependency-free app, pages, animated atmospheric artwork and explicit demo mode.

- [x] Read handoff, inspect reference and run baseline checks. Imported unchanged source from Downloads into this empty workspace.
- [x] Weather correctness: retain nulls, align preceding-hour precipitation, convert UTC instants with IANA timezones, retain requested dates, test recommendations and change detection.
- [x] Reliable client: stale/error/loading states, request races, watch reopening and monitoring all saved locations, optional AI fallback.
- [x] Server: public-file allowlist, validation, bounded cache with accurate timestamps, timeouts, optional AI protection, portable tests.
- [x] Visual refinement: retain 238px sidebar, midnight #060f25 cards, ocean #071b3c canvas, electric #087cff lighting, ice #66d7ff chart accents and existing system sans typography. Compact reference composition on desktop; two columns on tablet; labelled bottom navigation and touch controls on mobile.
- [x] Verify real Hamilton data including 2026-10-29, regression tests and rendered Edge screenshots at 1440, 768 and 390px.
- [x] Prepare static build, Vercel function adapters, CI and deployment instructions. No deployment or credentials changes.

Acceptance: no fictional fallback; missing/stale data cannot yield a fresh recommendation; no private files served; all original pages usable; no viewport overflow; reproducible checks and honest verification report.
