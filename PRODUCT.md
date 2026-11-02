# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Static HTML/CSS/ES-module JS with no build step, served as-is from `data/` by the dependency-free `server/server.js` (Node 22, Docker). The owner chose this over Vite/React so the deploy stays a plain volume mount.

## Users

The primary users are the whitelisted players of the ARDET Minecraft server, a small German-speaking group building Hogwarts together. They visit to check whether the server is up and who is online, copy the address, coordinate build work on the shared boards, look up coordinates, and open the live map. Newcomers are rare; they arrive by invitation and need the join instructions.

## Product Purpose

This is the group's coordination home outside the game. The Community Hub replaces scattered Discord messages for build tasks, design proposals, terraforming plans, the second building complex, and a shared coordinate list. Success means players open it during a session, find or add the task they need in seconds, and trust that everyone sees the same board.

## Positioning

It is a private, purpose-built workspace for one long-running build (Hogwarts on ARDET), not a generic server-listing page. Its boards are shared live between all visitors without accounts.

## Operating Context

- Often used alongside the game: on a second monitor or a phone next to the PC, sometimes at night.
- Discord stays in use for voice and quick chat; the site handles persistent lists.
- The live map runs separately at `https://map.ardet.de` and is embedded.
- Server status comes from the public mcsrvstat.us API.

## Capabilities and Constraints

- Views: Start (status, IP copy), Regeln, Beitreten (Java and Bedrock via GeyserMC), Community Hub (5 boards), Map, Staff. The full list is in `FEATURES.md`.
- The server address is **`mc.ardet.de`** (confirmed). The earlier `www.ardet.de` on the Join page was wrong.
- The server is whitelisted: an admin has to add new players.
- Boards have no accounts and no auth. Anyone with the URL can add, tick or delete. Writes are rate-limited to 60/min/IP; images are png/jpeg/gif/webp up to 4 MB; each board holds at most 500 items.
- The backend API and the `data/db/boards.json` format must not change without the owner's approval.
- All UI copy is German.

## Brand Commitments

- Name: **ARDET**. Main page heading: "Willkommen bei Hogwarts".
- Assets: `data/hogwarts-bg.jpg` (castle key art), `data/favicon.png` and `data/favicon.ico`.
- Staff: Pixel_wars and praeditus (Owner/Admin); praeditus (Bauleitung).
- Discord invite: `https://discord.gg/2SQccy5vT3`.

## Evidence on Hand

- Real content: the two rules, the join instructions, the staff list, the castle image.
- There are no player counts, screenshots of builds, testimonials or history. Do not invent any of these.

## Product Principles

1. The task comes first: status, the IP and the boards must be reachable in one tap.
2. Shared truth: every visitor must see the same board state, and failures are said out loud, never hidden.
3. Built for the play session: it has to read well at night, on a phone, and next to a running game.
4. The players' voice: plain, friendly German; no marketing tone.

## Accessibility & Inclusion

Target WCAG 2.2 AA, with full keyboard support and respect for reduced-motion preferences.
