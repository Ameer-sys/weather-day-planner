# ATMOS 2.1 release

## User-facing changes

- Button: **Ask OpenAI for deeper insight** → **Ask ATMOS Intelligence**.
- Panel subheading: **Context-aware weather guidance** → **Simple weather guidance for your plan**.
- Removed **RULE-BASED ANALYSIS**, **RULE-BASED FALLBACK**, provider branding and technical service errors from the panel.
- Replaced the API-key disclaimer with **Weather conditions can change, so check again before you go.**
- Guidance now separates a prominent recommendation, one short reason, a highlighted best time and practical precautions. Unsuitable weather never receives a reassuring best-time suggestion.
- The unavailable-service response is **Your forecast guidance is ready above.** Existing forecast-based advice stays visible.
- Planner configuration became **Your plan**; ranked windows became **Best three-hour options**. Alerts and settings descriptions use short, direct language. Offline/stale messages explain that weather could not be loaded/updated and ask the user to retry, without showing backend errors.

## Local verification

- `npm run check`: passed.
- `npm test`: 22 tests passed.
- `npm run build`: passed; six public browser assets.
- `npm run test:browser`: all 12 workflow groups passed, including real Hamilton weather/search, no-key guidance, missing/stale states, watchlists, timezone/race handling and all six pages at desktop/tablet/mobile sizes.
- Updated panel screenshots at 1440px and 390px were visually reviewed. Existing animations and reduced-motion behavior remain.
- Public paid AI remains disabled. Optional local paid-provider success/failure paths are mocked in tests; no paid call was made.

## Publishing

Public GitHub repository and Vercel project: **weather-day-planner**. Publication and deployment verification are in progress; final URLs and results will be recorded here after they are confirmed. No GitHub Pages configuration or custom-domain purchase is planned.
