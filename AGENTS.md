# JevPrompting

React 19 + Vite 8 + TypeScript 7 + Tailwind 4. Markdown prompt editor that ranks LLMs (OpenRouter live catalog) by fit, cost and estimated latency; prompt classification via TypeSafe Jev. Icons: `@gravity-ui/icons`. Light/dark theme.

## Commands
- `npm run dev` — dev server (runs Node with `--use-system-ca`; needed on this machine because TLS is intercepted).
- `npm test` — Vitest unit tests (`tests/unit`).
- `npm run typecheck` / `npm run build`.

## API key (BYOK)
- Public project: each user enters their own TypeSafe key in the header "API Key" dialog. Stored in `localStorage` (`jevprompting:typesafe-api-key`) and sent as `Authorization` to `/api/jev`.
- TypeSafe only allows CORS from `console.typesafe.ai`, so the browser cannot call `api.typesafe.ai` directly. Vite proxies `/api/jev` → `https://api.typesafe.ai/v1/systemone` forwarding the user's header (see `vite.config.ts`). `TYPESAFE_API_KEY` in `.env` is an optional local-dev fallback used only when the request has no key — never set it in a public deployment.
- In production the same `/api/jev` route is served by the Vercel Edge Function `api/jev.ts` (auto-published by Vercel), which forwards to the same origin with the user's `Authorization`. `vite dev`/`vite preview` use the Vite proxy instead; only one of the two is active per environment.
- 401/403 from Jev → verdict panel asks for a key. Analysis runs automatically, debounced (`ANALYSIS_DEBOUNCE_MS`), on every prompt or key change. Text-only input.

## Theming
- Semantic color tokens in `src/styles/globals.css` (`@theme` for light, `.dark` overrides). Use tokens (`bg-surface`, `text-ink-2`, `border-ok-line`, `text-on-brand`…), never raw palette classes, so dark mode keeps working. CodeMirror theme reads the same CSS variables.
- `index.html` sets the `dark` class before React renders to avoid a flash.

## Architecture
- `services/jev.ts` — Jev questions (choice/score/noul) → `PromptAnalysis`; `JevError` carries HTTP status.
- `services/openRouter.ts` — catalog fetch (cached in localStorage 6h).
- `services/modelRanker.ts` — pure scoring: cost, latency estimate, fit score, route tags.
- Constants live in `src/config.ts`; follows milo-react-organizer folder convention.
