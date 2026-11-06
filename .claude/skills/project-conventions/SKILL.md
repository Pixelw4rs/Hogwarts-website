---
name: project-conventions
description: Rules for changing the ARDET Hogwarts-website (React/Vite/Tailwind client in web/, dependency-free server, German UI, live data). Use before editing anything in web/, data/, server/, scripts/ or tests/.
user-invocable: false
---

# ARDET site conventions

## Stack
- The client is React + Vite + Tailwind v4 (TypeScript) in `web/`, entry `web/src/main.tsx`. Pin exact versions in `web/package.json`. 21st.dev / shadcn components go in `web/src/components/ui` and read the site tokens.
- Motion stays single-source: `data/css/motion.css` and the `data/js` modules are imported through the `@legacy` alias until each view is converted. Do not fork them into `web/`.
- `server/` stays dependency-free CommonJS. It serves the built site from `STATIC_ROOT` and data from `WEB_ROOT`.
- Server code in `server/` is CommonJS (`require`), Node 22, only built-in modules.
- Docker mounts `./server` read-only at `/app`, so the server must not write inside its own folder.

## Client
- UI copy is German (`lang="de"`). Keep wording consistent with existing views.
- No `console.log`/`console.debug` in `data/`, no inline event handlers, every `<img>` has `alt`, no duplicate ids. `npm run check` enforces these.
- CSS load order is tokens → base → components → views → pages → atlas → motion. Put new rules in the matching file and use tokens from `data/css/tokens.css`, not raw values.
- Visual decisions follow `DESIGN.md` (Wappenrolle design system). Respect reduced motion.
- The server address lives only in `data/js/config.js`.
- Accessibility: labels on every field, accessible names on icon buttons, live regions for status changes.

## Server and data
- The API contract in `FEATURES.md` ("Backend API" and "New API") must stay identical. Add tests in `tests/` for any change.
- Live data in `data/db/` (`boards.json`, `content.json`, `requests.json`) and `data/uploads/` is never tracked and never edited by hand from Claude.
- Admin: one account from `ADMIN_USER`/`ADMIN_PASSWORD`, in-memory sessions, same-origin check on writes, rate-limited login. Do not weaken these.

## Before finishing
Run `npm run check` and `npm test`. Update `FEATURES.md` when behaviour changes intentionally.
