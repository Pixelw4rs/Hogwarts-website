# Hogwarts-website

Holy Vibecode. This is the ARDET Minecraft server site: status, news, how to join, rules, the shared Community Hub boards, plugin/datapack wishes, the star-chart map and an admin area.

## Run

- `npm run dev`: serves `data/` on http://localhost:8080 (data is stored in `data/db/`). Reads `.env` if present.
- `npm test`: backend contract and client logic tests (`npm run test:coverage` for coverage)
- `npm run check`: dependency-free lint
- `npm run web:install` once, then `npm run web:dev`: the React site on http://localhost:5173 (also on your LAN), with `/api` proxied to `npm run dev` (set `ARDET_API` to point it elsewhere)
- `npm run web:build`: production build into `web/dist`
- Production: `docker compose up -d --build` (the image builds the React site; see `Dockerfile` and `docker-compose.yml`)

The client is a React + Vite + Tailwind v4 app in `web/` (entry `web/src/main.tsx`), so 21st.dev components can be installed directly. During the move it still imports the motion layer (`data/css/motion.css`), the live-data stores and helpers, and the Hub, Wünsche, Map and Admin modules from `data/js` through the `@legacy` alias; Start, Neuigkeiten, Regeln, Beitreten and Staff are React components. The old plain client in `data/` still runs with `npm run dev`.

The server serves the built site from `STATIC_ROOT` (in Docker: `/site` inside the image) and keeps the database and uploads in `WEB_ROOT` (`data/`). Without `STATIC_ROOT` it serves `data/` as before.

## Admin login

The Admin-Bereich (`#admin`, the key icon in the top bar) edits Staff, Regeln and Neuigkeiten, and lets the signed-in admin answer wishes on the Wünsche page.

1. Copy `.env.example` to `.env` (it is git-ignored).
2. Set `ADMIN_USER` and a long `ADMIN_PASSWORD` (12+ characters).
3. Restart: `docker compose up -d --build` (or `npm run dev` locally).

Without `ADMIN_PASSWORD` the admin area stays off; everything else works. Sessions last 12 hours and live in memory, so a restart signs you out. Five wrong passwords lock that IP for 15 minutes. If the site runs on https behind a proxy that doesn't send `X-Forwarded-Proto`, set `COOKIE_SECURE=1`.

## Data

All live data sits in `data/db/` (never tracked):

| File | Holds | Written by |
|---|---|---|
| `boards.json` | Community Hub boards | everyone |
| `content.json` | rules, staff, news | admin only (created with the original rules and staff) |
| `requests.json` | plugin/datapack wishes and votes | everyone (status, answer and delete: admin) |

## Docs

- [FEATURES.md](FEATURES.md): every feature that must keep working, plus the verification notes
- [PRODUCT.md](PRODUCT.md): who the site is for and its constraints
- [DESIGN.md](DESIGN.md): the Wappenrolle design system (with the Sternkarte and motion layer)
