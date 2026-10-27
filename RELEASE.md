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

- Public source: https://github.com/Ameer-sys/weather-day-planner
- Live website: https://weather-day-planner.vercel.app
- Staging preview: https://weather-day-planner-bcpxilxh8-ameer-sys-projects.vercel.app (Vercel authentication may be required).
- Application revision: `c4e2a4f0fe00de70f7b814fe1344cd9a59294efd`. GitHub Actions passed for this revision.
- Both deployments returned real Hamilton search results and a Toronto-timezone forecast with 24 hourly intervals on October 29, 2026.
- All 12 browser workflow groups also passed against the public production URL, with no JavaScript page errors. Production desktop and mobile Intelligence screenshots were visually reviewed.
- Anonymous production requests confirmed paid advice is disabled (503), invalid coordinates are rejected (400), and environment/Git/server files are unavailable (404). All four JavaScript/CSS application modules matched local source exactly.
- The first Vercel deployment was assigned to production despite requesting preview. A separate staging deployment was then built and its page, weather and search responses verified. This release record preserves that ordering rather than claiming a preview-first initial launch.
- No credentials were detected in the 37 initially staged files. Secrets and Vercel metadata remain ignored; `.env.example` contains placeholders only.
- The final test rerun required approved localhost access because the sandbox returned `EACCES`; all 22 tests passed with that access. A Vercel error/fatal log scan over the verification period found no matching logs. Continuous uptime monitoring is not configured.
- No GitHub Pages configuration, custom-domain purchase or paid AI call was made. `weatherdayplanner.com` remains a future preference only.
