# weather-day-planner: GitHub source and Vercel hosting

This remains the existing vanilla JavaScript/Node app. No framework migration or runtime dependencies were introduced. Node 22+ is required.

Published source: https://github.com/Ameer-sys/weather-day-planner. Live application: https://weather-day-planner.vercel.app. The connected Vercel project uses Node 24 and the `main` production branch.

## Local verification

```sh
npm run check
npm test
npm run build
npm run dev
```

Open http://localhost:3000. The server binds only to loopback. The default watch is Hamilton, Ontario, October 29, 2026, 10 AM–6 PM. If that date is outside the provider's forecast horizon, it stays selected and shows unavailable; choose a supported date in Trip Planner.

`npm run test:browser` uses an existing Playwright installation and Microsoft Edge. It calls the real Open-Meteo API and then uses clearly isolated test fixtures to exercise failures, alerts and request races. Set `PLAYWRIGHT_MODULES` to an existing absolute `node_modules` directory if Playwright is installed outside this project. Runtime dependencies remain zero. Screenshots and JSON evidence go to ignored `artifacts/`.

## Prepare GitHub

The requested public repository is `Ameer-sys/weather-day-planner`. The product name is **ATMOS — Your Weather & Outdoor Planning Dashboard**. GitHub stores the source and runs checks; Vercel runs the website and API routes. The supplied Downloads copy is unchanged.

`.gitignore` excludes credentials, generated output, evidence and Vercel metadata. `.github/workflows/checks.yml` runs syntax checks, offline regression tests and the static build on pushes and pull requests using Node 22. Require this check before merging. No deployment credentials are needed by CI.

## Vercel preview

Import the repository into your intended Vercel account/project. Use the repository root and Framework Preset **Other**. `vercel.json` specifies `npm run build` and output directory `dist`. Choose Node 22 or later. No weather API key or OpenAI key is required for the weather dashboard.

Only six explicit public assets are copied to `dist`. Root `api/*.mjs` functions reuse `backend.mjs` for forecast, geocoding and optional advice. Server source and environment files are never included in the public build. These adapters use Vercel's documented [Node request/response interface](https://vercel.com/docs/functions/runtimes/node-js).

Before releasing the same source revision to production, verify the preview:

- `/api/forecast?lat=43.2557&lon=-79.8711` returns a Toronto-timezone forecast, including the requested date if still within range.
- `/api/search?q=Hamilton` returns Hamilton, Ontario.
- All six pages, saved plans and mobile navigation work.
- `/.env`, `/.git/config`, `/backend.mjs` and `/server.mjs` are not publicly served.
- `/api/advice` returns 503 with the rule-based fallback on a hosted deployment.

Use project **weather-day-planner** in the connected Vercel team. Deploy and test a preview, then deploy the same source revision to production and verify it again. The first live address uses a free `.vercel.app` domain. The preferred future custom domain is `weatherdayplanner.com`; do not purchase or attach it without a separate request. Release outcomes are recorded in `RELEASE.md`.

## GitHub Pages is not the live host

GitHub Pages can serve a static website, but cannot execute the Node weather/search/advice routes. An adapted static demo could run there; this full live application needs Vercel or another backend-capable host. No Pages workflow or Pages configuration is included.

## Optional AI and operating limits

For local use, set `OPENAI_API_KEY` in the server environment and optionally `OPENAI_MODEL` (default `gpt-5-mini`). Never add a key to browser code, Git, or `VITE_`/`NEXT_PUBLIC_` variables. The server does not automatically load `.env`; Node's `--env-file=.env` can be used deliberately. Local AI accepts only loopback requests with valid JSON context, rejects cross-origin requests, limits payload size and permits at most 12 requests per hour per local client. `store:false` is sent to OpenAI.

AI is intentionally disabled when `VERCEL` is set. Before enabling paid AI for public users, implement authenticated access, durable per-user quotas and an account spending cap. An in-memory per-instance counter is not a reliable public spending control. Do not simply remove the hosted guard.

Weather caches are bounded, in-memory, and per instance (forecast 5 minutes; search 24 hours). A cache hit preserves the original upstream retrieval time. Failed requests do not manufacture weather data. The client marks failed/old data stale and pauses recommendations. For a public launch, configure rate controls at the hosting edge and review [Open-Meteo usage and commercial terms](https://open-meteo.com/en/terms).

Watchlists and alert history belong to the current browser. Up to 30 saved plans are checked while the tab is open; no closed-tab monitoring, accounts, email delivery, official alerts or trail-closure feeds are implemented.

## Forecast semantics

[Open-Meteo's documentation](https://open-meteo.com/en/docs) defines precipitation, precipitation probability and gusts over the preceding hour. ATMOS requests Unix timestamps, converts with the returned IANA timezone and shifts these measurements to label the start of their interval. A 10 AM–6 PM plan includes intervals starting 10 AM through 5 PM. Amount includes rain, showers and the water equivalent of snow.

Daily summary metrics are recomputed from hourly values grouped by actual local date, so DST days can contain 23 or 25 hours. The final forecast interval can be missing precipitation because its closing measurement is outside the returned horizon; it is shown as unavailable. A zero value is only displayed when actually provided. Recommendations are transparent planning heuristics, not official safety assessments.
