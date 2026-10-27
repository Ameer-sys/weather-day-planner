# ATMOS v2 verification

For the October 27 clarity update and verified public deployment (22 tests, six build assets), see [RELEASE.md](RELEASE.md). The evidence below records the original October 26 baseline.

## Full-width layout update — October 27, 2026

Local working-tree verification in Microsoft Edge: the original shell measured 1920px at a 3440px viewport. The width cap is removed; the sidebar starts at x=0 and the main area reaches the viewport's right edge. Desktop content padding stays within 24–32px. At 2200px and wider, a fourth grid column holds Intelligence and watched activities; chart proportions and readable text measures are preserved.

`npm run test:layout` passed all 36 page/viewport combinations (six pages at 1440, 1920, 2560, 3440, 768 and 390px), including chart containment and equal horizontal/vertical SVG scaling. Screenshots at each size were visually inspected. An ultrawide stale-data banner introduced no overlapping cards, and animations still run when reduced motion is off. No document horizontal overflow or JavaScript page errors were found. Syntax checks, all 22 automated tests and the production build also passed. This section records local changes, not a new production deployment.

Verified on October 26, 2026 (America/New_York), using Node 24.22.1 and installed Microsoft Edge on Windows. The supplied project was copied into this previously empty workspace; Downloads was not edited.

## Commands and observed results

| Command | Result |
| --- | --- |
| `npm run check` | Passed syntax checks for client, weather logic, server entry point and backend |
| `npm test` | 18 tests passed; 0 failed |
| `npm run build` | Passed; five public assets copied to `dist/` |
| `npm run test:browser` | 12 workflow groups passed; no JavaScript page errors |

The baseline syntax check passed, but all three original smoke tests failed on Windows because the child-process working directory used a URL pathname. The replacement tests exercise the actual shared handler on ephemeral localhost ports and require no external network. Browser/live checks used approved network access because the execution sandbox initially blocked local sockets and external requests. No sandbox configuration was changed.

## Live weather evidence

The application proxy and direct Open-Meteo requests both succeeded. Geocoding returned Hamilton, Ontario. The final verification response was fetched at **October 26, 2026, 11:52:20 PM EDT** (`2026-10-27T03:52:20.114Z`). It returned `America/Toronto`, 24 hourly intervals for October 29 and 25 for November 1, including both instances of 1 AM at the DST transition.

For the requested **October 29, 2026, 10 AM–6 PM Toronto time** waterfall hike/picnic window:

| Metric in the captured response | Value |
| --- | --- |
| Peak precipitation probability | 18% |
| Mean hourly precipitation probability | 9% |
| Total precipitation | 0.0 mm |
| Maximum wind/gust value | 51.1 km/h |
| Rule-based result | Use caution (wind), score 60/100 |

These are timestamped model forecasts, not guaranteed future conditions. No fictional values were substituted. The direct raw response is saved in `artifacts/hamilton-live.json`; the normalized application response is `artifacts/hamilton-verified.json`. Both are local, ignored evidence. Precipitation is aligned to interval starts according to [Open-Meteo's hourly definitions](https://open-meteo.com/en/docs).

## Regression coverage

- Missing/null values, malformed arrays and incomplete windows cannot yield dry-weather assumptions or a GO assessment.
- Hiking, rain, gust, thunder, freezing, snow and extreme-temperature thresholds.
- Hourly precipitation alignment, exclusive end times, date filtering and unavailable dates.
- Toronto midnight boundaries, spring-forward and fall-back, and matching-window change detection.
- Static public allowlist, encoded Windows paths, methods, coordinates and security headers.
- Weather provider failures and cache expiry with the original upstream fetch timestamp retained.
- Optional AI disabled without a key and on anonymous Vercel deployments; origin checks, input size/type, context filtering, response extraction, rate limits and sanitized provider failures. Paid OpenAI calls were mocked, not performed.

## Browser and visual coverage

All six pages were checked for document overflow at **1440×1100**, **768×1100**, and **390×844**. Desktop, tablet and mobile overview screenshots were captured and visually inspected, along with the mobile planner/settings/stale state and desktop forecast page. Refinement included darker reference-style cards, electric-blue depth, compact typography, tablet column composition, readable mobile graph labels, stacked mobile watch rows and labelled bottom navigation.

Browser workflows verified real Hamilton loading; retained out-of-range dates; date, activity and hour controls; saved-watch persistence/reopening/removal; chart mode and keyboard inspection; hourly table access; optional AI fallback; Celsius/Fahrenheit; animation toggle; OS reduced motion; refresh failures with stale data; initial offline state; explicit demo/live switching; missing measurements; multi-location polling and alerts; cancellation of old location requests and timezone changes. Failure, alert and race cases use isolated test fixtures derived from the captured response; they are never used by the production app.

`artifacts/browser-results.json` contains the executed workflow groups. Current overview captures are also in `assets/desktop-live.png`, `assets/tablet-live.png` and `assets/mobile-live.png`. Screenshots freeze motion through the browser's reduced-motion preference for a complete chart; normal app animations remain enabled.

## Remaining release checks

- No GitHub push or Vercel deployment was performed. A Vercel preview must verify platform packaging/routing before production promotion.
- Firefox, Safari/WebKit, physical-device touch behavior, a screen reader and actual OS notification delivery were not tested. Edge keyboard controls and reduced motion were tested.
- OpenAI success and failure paths were mocked; no real key was configured or exposed. Hosted paid AI remains disabled until authentication and durable quotas are implemented.
- Public usage must satisfy Open-Meteo terms and hosting rate controls. Watches remain browser-local and only refresh while the tab is open.

See [DEPLOYMENT.md](DEPLOYMENT.md) for the exact next steps.
