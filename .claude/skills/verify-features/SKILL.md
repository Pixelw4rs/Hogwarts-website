---
name: verify-features
description: Verify the site still meets FEATURES.md. Runs npm run check and npm test, starts a local server with throwaway demo data, walks the feature checklist in a headless browser, and reports failures per feature.
disable-model-invocation: true
---

# Verify features

`FEATURES.md` is the must-not-break list. This skill checks the current working tree against it.
Optional argument: a section name (for example `Community Hub` or `Wünsche`) to verify only that part.

## 1. Static checks

Run both and stop to report if either fails:

```bash
npm run check
npm test
```

## 2. Start a throwaway server

Never point the browser pass at the real `data/db/`. Copy the site to a temp dir and run the server there, with a test admin login:

```bash
TMP=$(mktemp -d)
cp -r data "$TMP/data" && rm -rf "$TMP/data/db" "$TMP/data/uploads"
PORT=8099 WEB_ROOT="$TMP/data" ADMIN_USER=verify ADMIN_PASSWORD=verify-password-123 node server/server.js
```

Run the server in the background and wait until `http://localhost:8099/api/boards` answers.

## 3. Browser pass

Use the browser MCP that is connected (Playwright or Chrome DevTools). Read `FEATURES.md` first and walk every item in scope. At minimum cover the list under "Redesign verification" and the "News, wishes, admin and Sternkarte" section:

- every `#hash` route loads, nav order, view transitions, tab keys (arrows, Home/End)
- copy IP button ("Kopiert!" then restored)
- server status line
- Hub: add, toggle done, delete with undo (server delete after 5 s), search and no-match state, image limit/preview/upload, offline banner, 5 s poll
- wishes: create, vote once per browser
- admin: login with the test credentials, edit Staff, Regeln, Neuigkeiten, answer a wish, logout
- map lazy loading, star chart renders
- night/day theme toggle and reduced motion
- console has no errors

Take screenshots at 1440 and 390 width, in night and day theme.

## 4. Clean up and report

Stop the server and delete `$TMP`. Report a table: feature, pass/fail, evidence (what you saw or the error). List failures first. Do not tick boxes in `FEATURES.md` unless the user asks.
