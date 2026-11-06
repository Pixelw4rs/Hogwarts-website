# FEATURES — must-not-break list

Audit of the site as of commit `a1331fe` (before the redesign). Every item here
must still work after the rewrite. Tick each one during verification.

## Architecture

- [x] **Single-page site**, written in German (`lang="de"`). React + Vite + Tailwind app in `web/` (built into `web/dist`); the earlier plain client in `data/index.html` still works for `npm run dev`.
- [x] **Static assets** in `data/`: `favicon.png`, `favicon.ico`, `hogwarts-bg.jpg`.
- [x] **Backend** in `server/server.js`: dependency-free Node HTTP server (Node 22 in Docker).
- [x] **Deployment** via `docker-compose.yml` + `Dockerfile`: the image builds the React site into `/site`; compose mounts `./server` read-only and `./data` read-write, port 8080, env `PORT`, `WEB_ROOT` (database, uploads) and `STATIC_ROOT` (site files; defaults to `WEB_ROOT`). Uploads under `/uploads/` are always served from `WEB_ROOT`.
- [x] **Board cards on Start** lift 4px in 220ms on hover/focus (the long drop and cloth swing were dropped on request).
- [x] **Health check** runs `GET /api/boards` every 30s.

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

- [x] Brand "ARDET" with a glowing orb mark.
- [x] Sticky, blurred header containing the tab nav. The nav scrolls horizontally on narrow screens.
- [x] The active tab is highlighted with a gold underline.
- [x] `<title>` is "ARDET — Minecraft Server"; `theme-color` is `#0e1519`.
- [x] Favicons: PNG, ICO, and apple-touch-icon.
- [x] Fonts: Cormorant Garamond (display), Space Grotesk (body), IBM Plex Mono (code).
- [x] Background: blurred `hogwarts-bg.jpg` layered under a gold radial glow and a dark gradient.
- [x] `:focus-visible` outline in glow blue.

### Start (home)

- [x] Shows the server address `mc.ardet.de`.
- [x] **Copy IP** button writes `mc.ardet.de` to the clipboard, shows "Kopiert!" for 1.4s, then restores its label.
- [x] **Live status** comes from `GET https://api.mcsrvstat.us/3/mc.ardet.de` (`cache: no-store`):
  - [x] While loading: "Status wird geprüft…" with a neutral dot.
  - [x] Online: green dot, "Online", players `online / max`, version string.
  - [x] Offline: red dot, "Offline", players and version shown as "—".
  - [x] Fetch error: red dot, "Status nicht verfügbar", "—" values.
  - [x] Status refreshes on page load, every 60s while the page is visible, and whenever the Start tab is opened.
- [x] Feature cards: Community Hub, Server-Map, Discord (link `https://discord.gg/2SQccy5vT3`, opens in a new tab with `rel=noopener`).

### Regeln

- [x] Numbered list with CSS counters:
  1. Redstone-/Farm-Lag im Blick behalten — Chunks verantwortungsvoll laden.
  2. Große Terraforming- oder Gelände-Projekte zuerst auf das Terraforming-Board.

### Beitreten

- [x] Java card: add `www.ardet.de`; the server is whitelisted, so ask an admin to be added.
- [x] Bedrock card: use a GeyserMC-compatible client and connect to `www.ardet.de` on the port an admin gives you.
- [x] ~~Inconsistency~~ resolved: the owner confirmed `mc.ardet.de`, and the Join page now uses it.

### Map

- [x] Iframe to `https://map.ardet.de`, **lazy**: `src` is set only the first time the Map tab is opened.
- [x] Fallback link "In neuem Tab öffnen".
- [x] The iframe fills the viewport height (`100vh - 170px`, min 420px) and uses a wider container (max 1400px).
- [x] Has `allow="fullscreen"` and `referrerpolicy="no-referrer-when-downgrade"`.

### Staff

- [x] Pills: "Owner — Pixel_wars | praeditus", "Admin — Pixel_wars | praeditus", "Bauleitung — praeditus".

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

- [x] **Add item:** title is required (an empty title does nothing); meta and image are optional.
  - [x] Images must be png, jpeg, gif or webp, at most 4 MB (checked on the client), and are sent as a data URL.
  - [x] An oversized image shows "Bild zu groß (max. 4 MB)."; an unreadable file shows "Bild konnte nicht gelesen werden."
  - [x] Inputs clear optimistically. **If saving fails, the title and meta are restored.**
- [x] **Toggle done** with a checkbox. A done item is dimmed to 50% with its title struck through.
- [x] **Delete** with the × button (no confirmation today).
- [x] **Image thumbnail** 56×56, linking to the full image in a new tab.
- [x] **Meta** shown in monospace under the title.
- [x] **States:**
  - [x] Loading: "Wird geladen…" while `rev < 0`.
  - [x] Empty: "Noch nichts hier — füge oben den ersten Eintrag hinzu."
  - [x] Error banner (`#hubStatus`): the server's error message, or the offline message "Server nicht erreichbar — Einträge können gerade nicht geladen oder gespeichert werden." for network errors. It clears on the next success.
- [x] **Sync:**
  - [x] Initial fetch on page load.
  - [x] Refetch whenever the Community tab is opened.
  - [x] Poll every 5s while the tab is visible and the Hub view is shown.
  - [x] Refetch when the browser tab becomes visible again (if the Hub is shown).
  - [x] Re-render only when `rev` changes.
- [x] **XSS safety:** title and meta are HTML-escaped and ids are sanitized to alphanumerics.

## Backend API (contract must stay identical)

The data file is `data/db/boards.json`, shaped `{ rev: number, boards: { build|design|terraforming|complex|map: Item[] } }`.
An `Item` is `{ id: hex12, title ≤200, meta ≤100, image: "/uploads/<board>/<id>.<ext>" | null, done: bool, created: ms }`.

| Method | Path | Behavior |
|---|---|---|
| GET | `/api/boards` | Full state |
| POST | `/api/boards/:board/items` | `{title, meta, image?}` → prepends the item, returns full state. Errors: 400 "Titel fehlt", 409 board full (500 items) |
| PATCH | `/api/boards/:board/items/:id` | `{done: bool}` → full state; 404 if the item is missing |
| DELETE | `/api/boards/:board/items/:id` | Removes the item and its uploaded image → full state (idempotent) |

- [x] Every write bumps `rev` and is saved with an atomic write (tmp file + rename).
- [x] A corrupt DB is backed up to `boards.json.corrupt-<ts>` and the server starts empty.
- [x] Write rate limit: 60 per minute per IP (honours `X-Forwarded-For`), answering 429 "Zu viele Änderungen — kurz warten."
- [x] Body limit is 6 MB (413); the decoded image limit is 4 MB (413); only png/jpeg/gif/webp data URLs are accepted.
- [x] Error messages are in German and returned as JSON `{error}`.
- [x] Static server: serves `WEB_ROOT`, maps `/` to `index.html`, blocks path traversal, dotfiles and `/db/`; HTML, CSS and JS are sent `no-cache` (changed 2026-11-02 with the owner's approval, so deploys never mix versions); images and other files `max-age=3600`.
- [x] Image deletion only touches paths matching `/uploads/<board>/<hex>.<ext>`.

## Known gaps (to fix in the redesign, without changing behavior)

- Tabs are `<button>`s without `role="tab"`, `aria-selected` or arrow-key support, and there is no URL hash, so views can't be linked or reached with Back.
- Inputs have placeholders but no `<label>`s; the checkbox and × button have no accessible names.
- The error banner isn't a live region, and nothing announces status changes.
- The add-buttons use inline `onclick` handlers.
- Delete has no confirmation and no undo.
- The rendered `<img>` has no width/height, which causes layout shift.
- There is no `prefers-reduced-motion` handling (and almost no motion).
- The client hardcodes the IP string in two places in JS plus the markup.

All eight gaps are fixed in the redesign: ARIA tabs with arrow keys and Home/End, `#hash` routes, labels on every field, live regions, no inline handlers, undo for delete, fixed image sizes, reduced-motion support, and the address set in one place (`data/js/config.js`).

## Redesign verification (2026-11-02, branch `redesign`)

**How it was verified:**
- `npm test` runs 38 tests: 17 backend contract tests against the unchanged `server.js`, plus 21 unit tests for the DOM-free client modules.
- `npm run check` lints syntax, asset references, inline handlers and duplicate ids.
- A scripted headless-browser pass against a local copy with demo data covered:
  - copy IP (label "Kopiert!", restored after 1.4s)
  - status display
  - tab keyboard navigation and hashes
  - add, toggle and delete with undo, plus the server-side delete after 5s
  - search and the no-match state
  - image size limit, preview, upload and thumbnail link
  - title/meta restored when saving fails
  - offline banner and its clearing
  - the 5s poll
  - lazy map loading and its attributes
  - Discord link attributes
  - rules and staff content
- Screenshots: desktop 1440 and mobile 390, night and day.

**Intentional behaviour changes:**
1. **Delete** hides the entry immediately and shows a 5-second "Rückgängig" toast. The `DELETE` request is sent when the toast expires, or right away if the page is hidden or closed (`keepalive`).
2. **Empty title** now shows "Bitte einen Titel eingeben." inline. Before, nothing happened.
3. **Image errors** ("Bild zu groß (max. 4 MB).", unreadable file, wrong type) appear inline under the form instead of in the Hub banner. The text is the same. An image is checked and previewed as soon as it's chosen.
4. **Server status** on Start is a plain line (status · players · version) instead of three boxes. It shows "Status wird geprüft…" only on the first check. Later checks update the values in place, without flicker. Opening Start still triggers a recheck.
5. **Board data** is also polled every 5s while Start is open, because Start now shows live board counts.
6. **Join page** shows `mc.ardet.de`, which is now confirmed as the only address.
7. **Views** have URLs (`#regeln`, `#hub/map`…), so Back/Forward and deep links work.
8. **Visual identity** is replaced: new fonts, a castle image band instead of the blurred full-page background, and a night/day theme switch. Night is the default; day is opt-in and remembered per browser.
9. **Leaving the page** with a typed but unsent title now asks for confirmation.

**Vercel guideline deviations (accepted):**
- Three animations go beyond transform/opacity:
  - the banner unfurl (`clip-path`)
  - the undo ring (a custom property)
  - the skeleton shimmer (`background-position`)

  All three are short, run on few elements, and are off under reduced motion.
- Lists aren't virtualized: there are at most 500 entries per board, and rows are keyed and patched in place.
- Fonts come from Google Fonts with `preconnect` and no preload, because the font file URLs aren't stable.

**Resolved after review:**
- Asset caching: `server.js` used to send `.css`/`.js` with `max-age=3600`, so after a deploy returning visitors could run new HTML against cached old modules. With the owner's approval it now sends them `no-cache` (one line in `serveStatic`, covered by a test). Images keep the 1h cache.

## News, wishes, admin and Sternkarte (2026-11-03, branch `feature/news-requests-admin`)

Requested by the owner: more motion when switching tabs and on scroll, the Map in the Impeccable "star atlas" option, a news feed, a public plugin/datapack wish page, and an admin login to edit Staff, Regeln and Neuigkeiten. The `/api/boards` contract is unchanged; everything below is new.

### Views (nav order = transition direction)

| Hash | View | Notes |
|---|---|---|
| `#start` | Start | + "Neuigkeiten" teaser (latest 2 posts, hidden when there are none) |
| `#neuigkeiten` | Neuigkeiten | Pinned first, then newest. Tag ribbon: Info / Update / Event / Wartung |
| `#regeln` | Regeln | Now loaded from `/api/content` (`<noscript>` keeps the original two rules) |
| `#beitreten` | Beitreten | unchanged |
| `#hub`, `#hub/<board>` | Community Hub | The coordinate board shows the star chart beside its list |
| `#wuensche`, `#wuensche/plugin`, `#wuensche/datapack` | Wünsche | Submit, vote, filter. Admin sees status, answer and delete inline |
| `#map`, `#map/live` | Server-Karte | Sternkarte (default) and Live-Karte (the iframe) |
| `#staff` | Staff | Now loaded from `/api/content` |
| `#admin`, `#admin/staff`, `#admin/regeln`, `#admin/neuigkeiten` | Admin-Bereich | Not in the main nav: key icon in the bar and "Admin" in the footer |

### New API

| Method | Path | Who | Behavior |
|---|---|---|---|
| GET | `/api/auth/me` | all | `{ user, configured }` |
| POST | `/api/auth/login` | all | `{username, password}` → HttpOnly SameSite=Strict cookie (12h). 401 on wrong data, 429 after 5 failures/15 min/IP or 20 failures/15 min in total, 503 if `ADMIN_PASSWORD` is unset |
| POST | `/api/auth/logout` | all | Ends the session |
| GET | `/api/content` | all | `{ rev, rules, staff, news }` (news sorted pinned → newest) |
| PUT | `/api/content/rules` | admin | Replaces the list (≤50, ≤500 chars, empty dropped) |
| PUT | `/api/content/staff` | admin | Replaces the roles (≤20, tincture ∈ gules/purpure/vert/azure/sable) |
| POST/PATCH/DELETE | `/api/content/news[/:id]` | admin | title ≤120 required, body ≤5000, tag ∈ info/update/event/wartung, pinned |
| GET | `/api/requests` | all | `{ rev, requests }` with `votes` and `voted`, never the voter ids |
| POST | `/api/requests` | all | `{kind: plugin\|datapack, name, link?, reason?, by?}`. Only http(s) links. 5 per 10 min per IP, 30 per hour in total |
| POST | `/api/requests/:id/vote` | all | `{vote: bool}`. One vote per browser (`ardet_voter` cookie), at most 1000 voters per wish |
| PATCH/DELETE | `/api/requests/:id` | admin | status ∈ open/review/accepted/done/rejected, note ≤300 |

Admin writes and logout refuse a foreign `Origin` (403). Every body is capped at 16 KB, except board uploads (6 MB). Content and wishes are stored like the boards: atomic write and a corrupt-file backup.

### Motion

- Page switches slide the new page in from the side you're heading to (by nav order), as a plain keyframe on the live page. No View Transition, so the cursor and click ripples keep moving during the switch.
- The nav, board tabs, wish filters, map tabs and admin tabs have a sliding indicator (ported from the 21st.dev "Tabs" component). Board and section panels slide in from the side of the chosen tab.
- Scroll reveal: rows rise, posts and editions unroll, pennants unfurl from the gilt rail, staggered.
- Rolling numbers on pennant counts and vote counts.
- The castle image drifts and the hero lifts on scroll (scroll-driven animation, where supported).
- Star chart: rings and stars rise in, the dust twinkles, and the picked star gets a torch ring and a leader line.
- Ambient pointer layer (from the owner's "rootless" animation kit, `data/js/lib/rootless-animations.js`, wired in `components/ambient.js`): a gilt blob cursor that grows over controls and squishes on press, a gold ripple at every click or tap (always 120px, the same on controls as on the empty page), and hero letters that zoom in out of a blur and then drift away from the pointer. The blob cursor is off on touch devices; the native cursor stays in text fields.
- All of it is off under `prefers-reduced-motion`, and the reveal never hides content if JS fails.

### Intentional behaviour changes

1. **The Map tab opens the Sternkarte**. The live map iframe is still lazy, but now loads the first time **Live-Karte** is opened (`#map/live`), not the first time the Map tab is opened.
2. **Rules and staff** come from the server instead of the HTML. They're seeded with the original text on first start.
3. Board data is also polled on the Map view, because the star chart reads the coordinate board.
