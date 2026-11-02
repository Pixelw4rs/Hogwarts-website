# FEATURES — must-not-break list

Audit of the site as of commit `a1331fe` (before the redesign). Every item here
must still work after the rewrite. Tick each one during verification.

## Architecture

- [ ] **Single-page site** at `data/index.html`, written in German (`lang="de"`). No framework and no build step.
- [ ] **Static assets** in `data/`: `favicon.png`, `favicon.ico`, `hogwarts-bg.jpg`.
- [ ] **Backend** in `server/server.js`: dependency-free Node HTTP server (Node 22 in Docker).
- [ ] **Deployment** via `docker-compose.yml`: mounts `./server` read-only and `./data` read-write, port 8080, env `PORT` and `WEB_ROOT`.
- [ ] **Health check** runs `GET /api/boards` every 30s.

## Pages / views

Tabs in a sticky header switch views client-side, with no URL change and no routing.

| # | View id | Tab label | Content |
|---|---|---|---|
| 1 | `home` | Start | Hero "Willkommen bei Hogwarts", IP box, live status, 3 feature cards |
| 2 | `rules` | Regeln | Numbered rules list (2 rules) |
| 3 | `join` | Beitreten | Java Edition card and Bedrock (GeyserMC) card |
| 4 | `community` | Community Hub | 5 shared boards |
| 5 | `map` | Map | Embedded live map iframe |
| 6 | `staff` | Staff | Staff pills: Owner/Admin "Pixel_wars \| praeditus", Bauleitung "praeditus" |

### Shell

- [ ] Brand "ARDET" with a glowing orb mark.
- [ ] Sticky, blurred header containing the tab nav. The nav scrolls horizontally on narrow screens.
- [ ] The active tab is highlighted with a gold underline.
- [ ] `<title>` is "ARDET — Minecraft Server"; `theme-color` is `#0e1519`.
- [ ] Favicons: PNG, ICO, and apple-touch-icon.
- [ ] Fonts: Cormorant Garamond (display), Space Grotesk (body), IBM Plex Mono (code).
- [ ] Background: blurred `hogwarts-bg.jpg` layered under a gold radial glow and a dark gradient.
- [ ] `:focus-visible` outline in glow blue.

### Start (home)

- [ ] Shows the server address `mc.ardet.de`.
- [ ] **Copy IP** button writes `mc.ardet.de` to the clipboard, shows "Kopiert!" for 1.4s, then restores its label.
- [ ] **Live status** comes from `GET https://api.mcsrvstat.us/3/mc.ardet.de` (`cache: no-store`):
  - [ ] While loading: "Status wird geprüft…" with a neutral dot.
  - [ ] Online: green dot, "Online", players `online / max`, version string.
  - [ ] Offline: red dot, "Offline", players and version shown as "—".
  - [ ] Fetch error: red dot, "Status nicht verfügbar", "—" values.
  - [ ] Status refreshes on page load, every 60s while the page is visible, and whenever the Start tab is opened.
- [ ] Feature cards: Community Hub, Server-Map, Discord (link `https://discord.gg/2SQccy5vT3`, opens in a new tab with `rel=noopener`).

### Regeln

- [ ] Numbered list with CSS counters:
  1. Redstone-/Farm-Lag im Blick behalten — Chunks verantwortungsvoll laden.
  2. Große Terraforming- oder Gelände-Projekte zuerst auf das Terraforming-Board.

### Beitreten

- [ ] Java card: add `www.ardet.de`; the server is whitelisted, so ask an admin to be added.
- [ ] Bedrock card: use a GeyserMC-compatible client and connect to `www.ardet.de` on the port an admin gives you.
- ⚠ **Inconsistency:** the hero shows `mc.ardet.de` but the Join page says `www.ardet.de`. This is kept as-is until the owner decides which is correct.

### Map

- [ ] Iframe to `https://map.ardet.de`, **lazy**: `src` is set only the first time the Map tab is opened.
- [ ] Fallback link "In neuem Tab öffnen".
- [ ] The iframe fills the viewport height (`100vh - 170px`, min 420px) and uses a wider container (max 1400px).
- [ ] Has `allow="fullscreen"` and `referrerpolicy="no-referrer-when-downgrade"`.

### Staff

- [ ] Pills: "Owner — Pixel_wars | praeditus", "Admin — Pixel_wars | praeditus", "Bauleitung — praeditus".

## Community Hub (shared boards)

Five boards, switched by sub-tabs:

| Board key | Tab label | Title placeholder | Meta placeholder | Button |
|---|---|---|---|---|
| `build` | Bauaufgaben | Aufgabe, z. B. 'Dachdetails hinzufügen' | Zugewiesen an (optional) | Aufgabe hinzufügen |
| `design` | Design-Vorschläge | Vorschlag, z. B. 'Terrakotta-Dach für die Mühle' | Von (optional) | Vorschlag hinzufügen |
| `terraforming` | Terraforming | Projekt, z. B. 'Hügel bei Spawn einebnen' | Zugewiesen an (optional) | Projekt hinzufügen |
| `complex` | Zweiter Gebäudekomplex | Aufgabe, z. B. 'Ecke updaten' | Zugewiesen an (optional) | Aufgabe hinzufügen |
| `map` | Server-Map (Koordinaten) | Name, z. B. 'Eisenfarm' | X Y Z / Dimension | Ort hinzufügen |

### Behaviors

- [ ] **Add item:** title is required (an empty title does nothing); meta and image are optional.
  - [ ] Images must be png, jpeg, gif or webp, at most 4 MB (checked on the client), and are sent as a data URL.
  - [ ] An oversized image shows "Bild zu groß (max. 4 MB)."; an unreadable file shows "Bild konnte nicht gelesen werden."
  - [ ] Inputs clear optimistically. **If saving fails, the title and meta are restored.**
- [ ] **Toggle done** with a checkbox. A done item is dimmed to 50% with its title struck through.
- [ ] **Delete** with the × button (no confirmation today).
- [ ] **Image thumbnail** 56×56, linking to the full image in a new tab.
- [ ] **Meta** shown in monospace under the title.
- [ ] **States:**
  - [ ] Loading: "Wird geladen…" while `rev < 0`.
  - [ ] Empty: "Noch nichts hier — füge oben den ersten Eintrag hinzu."
  - [ ] Error banner (`#hubStatus`): the server's error message, or the offline message "Server nicht erreichbar — Einträge können gerade nicht geladen oder gespeichert werden." for network errors. It clears on the next success.
- [ ] **Sync:**
  - [ ] Initial fetch on page load.
  - [ ] Refetch whenever the Community tab is opened.
  - [ ] Poll every 5s while the tab is visible and the Hub view is shown.
  - [ ] Refetch when the browser tab becomes visible again (if the Hub is shown).
  - [ ] Re-render only when `rev` changes.
- [ ] **XSS safety:** title and meta are HTML-escaped and ids are sanitized to alphanumerics.

## Backend API (contract must stay identical)

The data file is `data/db/boards.json`, shaped `{ rev: number, boards: { build|design|terraforming|complex|map: Item[] } }`.
An `Item` is `{ id: hex12, title ≤200, meta ≤100, image: "/uploads/<board>/<id>.<ext>" | null, done: bool, created: ms }`.

| Method | Path | Behavior |
|---|---|---|
| GET | `/api/boards` | Full state |
| POST | `/api/boards/:board/items` | `{title, meta, image?}` → prepends the item, returns full state. Errors: 400 "Titel fehlt", 409 board full (500 items) |
| PATCH | `/api/boards/:board/items/:id` | `{done: bool}` → full state; 404 if the item is missing |
| DELETE | `/api/boards/:board/items/:id` | Removes the item and its uploaded image → full state (idempotent) |

- [ ] Every write bumps `rev` and is saved with an atomic write (tmp file + rename).
- [ ] A corrupt DB is backed up to `boards.json.corrupt-<ts>` and the server starts empty.
- [ ] Write rate limit: 60 per minute per IP (honours `X-Forwarded-For`), answering 429 "Zu viele Änderungen — kurz warten."
- [ ] Body limit is 6 MB (413); the decoded image limit is 4 MB (413); only png/jpeg/gif/webp data URLs are accepted.
- [ ] Error messages are in German and returned as JSON `{error}`.
- [ ] Static server: serves `WEB_ROOT`, maps `/` to `index.html`, blocks path traversal, dotfiles and `/db/`; HTML is sent `no-cache`, everything else `max-age=3600`.
- [ ] Image deletion only touches paths matching `/uploads/<board>/<hex>.<ext>`.

## Known gaps (to fix in the redesign, without changing behavior)

- Tabs are `<button>`s without `role="tab"`, `aria-selected` or arrow-key support, and there is no URL hash, so views can't be linked or reached with Back.
- Inputs have placeholders but no `<label>`s; the checkbox and × button have no accessible names.
- The error banner isn't a live region, and nothing announces status changes.
- The add-buttons use inline `onclick` handlers.
- Delete has no confirmation and no undo.
- The rendered `<img>` has no width/height, which causes layout shift.
- There is no `prefers-reduced-motion` handling (and almost no motion).
- The client hardcodes the IP string in two places in JS plus the markup.
