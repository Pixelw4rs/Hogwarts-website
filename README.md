# Hogwarts-website

Holy Vibecode. This is the ARDET Minecraft server site: status, how to join, rules, the shared Community Hub boards and the live map.

## Run

- `npm run dev`: serves `data/` on http://localhost:8080 (data is stored in `data/db/boards.json`)
- `npm test`: backend contract and client logic tests (`npm run test:coverage` for coverage)
- `npm run check`: dependency-free lint
- Production: `docker compose up -d` (see `docker-compose.yml`)

There is no build step. `data/` is served as-is: `index.html`, `css/` (tokens → base → components → views) and `js/` (ES modules, entry `js/main.js`).

## Docs

- [FEATURES.md](FEATURES.md): every feature that must keep working, plus the redesign verification
- [PRODUCT.md](PRODUCT.md): who the site is for and its constraints
- [DESIGN.md](DESIGN.md): the Wappenrolle design system
