# Hogwarts-website

Holy Vibecode. This is the ARDET Minecraft server site: status, news, how to join, rules, the shared Community Hub boards, plugin/datapack wishes, the star-chart map and an admin area.

## Run

- `npm run dev`: serves `data/` on http://localhost:8080 (data is stored in `data/db/`). Reads `.env` if present.
- `npm test`: backend contract and client logic tests (`npm run test:coverage` for coverage)
- `npm run check`: dependency-free lint
- Production: `docker compose up -d` (see `docker-compose.yml`)

There is no build step. `data/` is served as-is: `index.html`, `css/` (tokens → base → components → views → pages → atlas → motion) and `js/` (ES modules, entry `js/main.js`).

## Admin login

The Admin-Bereich (`#admin`, the key icon in the top bar) edits Staff, Regeln and Neuigkeiten, and lets the signed-in admin answer wishes on the Wünsche page.

1. Copy `.env.example` to `.env` (it is git-ignored).
2. Set `ADMIN_USER` and a long `ADMIN_PASSWORD` (12+ characters).
3. Restart: `docker compose up -d` (or `npm run dev` locally).

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
