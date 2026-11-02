---
name: ARDET
description: Coordination home for the ARDET Minecraft server's Hogwarts build, drawn as a heraldic roll of arms.
colors:
  or: "#d4a23c"
  or-hi: "#e7bc5e"
  on-or: "#1a1206"
  gules: "#b0362c"
  purpure: "#6c3a86"
  vert: "#276b44"
  azure: "#2d5ba6"
  sable-field: "#2a2430"
  on-tincture: "#fff8ea"
  ground: "#141116"
  ground-raised: "#1d1920"
  ground-sunk: "#0f0d11"
  ink: "#ece6da"
  ink-dim: "#b4ac9f"
  rule: "rgb(236 230 218 / 0.14)"
  rule-strong: "rgb(236 230 218 / 0.28)"
  state-on: "#4cc283"
  state-off: "#e2604f"
  state-wait: "#8a8379"
  or-day: "#a3741f"
  or-hi-day: "#b8862a"
  link-day: "#7a5810"
  ground-day: "#efe9dd"
  ground-raised-day: "#f8f4ec"
  ground-sunk-day: "#e4ddcf"
  ink-day: "#1b171d"
  ink-dim-day: "#5a5258"
  sable-field-day: "#1e1a21"
  state-on-day: "#22884f"
  state-off-day: "#b3392b"
typography:
  display:
    fontFamily: "IM Fell English SC, Iowan Old Style, Georgia, serif"
    fontSize: "clamp(2.75rem, 1.6rem + 4.6vw, 4.75rem)"
    fontWeight: 400
    lineHeight: 1.05
    letterSpacing: "0.005em"
  headline:
    fontFamily: "IM Fell English SC, Iowan Old Style, Georgia, serif"
    fontSize: "clamp(2.25rem, 1.6rem + 2.4vw, 3.5rem)"
    fontWeight: 400
    lineHeight: 1.05
  banner:
    fontFamily: "IM Fell English SC, Iowan Old Style, Georgia, serif"
    fontSize: "clamp(2rem, 1.5rem + 1.6vw, 2.5rem)"
    fontWeight: 400
    lineHeight: 1.05
  title:
    fontFamily: "IM Fell English SC, Iowan Old Style, Georgia, serif"
    fontSize: "1.75rem"
    fontWeight: 400
    lineHeight: 1.05
  numeral:
    fontFamily: "Atkinson Hyperlegible, system-ui, sans-serif"
    fontSize: "clamp(2.5rem, 1.8rem + 2.2vw, 4.25rem)"
    fontWeight: 700
    lineHeight: 1
  body:
    fontFamily: "Atkinson Hyperlegible, system-ui, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.55
    fontFeature: "tnum"
  lede:
    fontFamily: "Atkinson Hyperlegible, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 400
    lineHeight: 1.55
  ui-strong:
    fontFamily: "Atkinson Hyperlegible, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 700
    lineHeight: 1
  label:
    fontFamily: "Atkinson Hyperlegible, system-ui, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 400
    letterSpacing: "0.08em"
  mono:
    fontFamily: "JetBrains Mono, ui-monospace, Cascadia Mono, monospace"
    fontSize: "0.92em"
    fontWeight: 600
rounded:
  hairline-corner: "2px"
spacing:
  s1: "4px"
  s2: "8px"
  s3: "12px"
  s4: "16px"
  s5: "20px"
  s6: "24px"
  s8: "32px"
  s10: "40px"
  s12: "48px"
  s16: "64px"
  hit: "44px"
  bar-h: "64px"
  page-max: "1280px"
components:
  button-or:
    backgroundColor: "{colors.or}"
    textColor: "{colors.on-or}"
    typography: "{typography.ui-strong}"
    rounded: "{rounded.hairline-corner}"
    padding: "0 16px"
    height: "44px"
  button-or-hover:
    backgroundColor: "{colors.or-hi}"
    textColor: "{colors.on-or}"
  button-quiet:
    textColor: "{colors.ink}"
    typography: "{typography.ui-strong}"
    rounded: "{rounded.hairline-corner}"
    padding: "0 16px"
    height: "44px"
  button-icon:
    textColor: "{colors.ink-dim}"
    rounded: "{rounded.hairline-corner}"
    size: "44px"
  button-icon-small:
    textColor: "{colors.ink-dim}"
    rounded: "{rounded.hairline-corner}"
    size: "32px"
  input:
    backgroundColor: "{colors.ground-sunk}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.hairline-corner}"
    padding: "0 12px"
    height: "44px"
  nav-link:
    textColor: "{colors.ink-dim}"
    typography: "{typography.body}"
    padding: "0 16px"
    height: "44px"
  nav-link-active:
    textColor: "{colors.ink}"
  board-tab:
    textColor: "{colors.ink-dim}"
    typography: "{typography.body}"
    padding: "0 16px"
    height: "44px"
  board-tab-selected:
    textColor: "{colors.ink}"
  pennant:
    textColor: "{colors.on-tincture}"
    padding: "24px 16px 64px"
    height: "320px"
  tincture-banner:
    textColor: "{colors.on-tincture}"
    typography: "{typography.banner}"
    padding: "20px 48px 20px 24px"
  undo-toast:
    backgroundColor: "{colors.ground-raised}"
    textColor: "{colors.ink}"
    rounded: "{rounded.hairline-corner}"
    padding: "8px 8px 8px 16px"
  add-form:
    backgroundColor: "{colors.ground-raised}"
    rounded: "{rounded.hairline-corner}"
    padding: "16px"
  name-tag:
    textColor: "{colors.ink}"
    typography: "{typography.mono}"
    rounded: "{rounded.hairline-corner}"
    padding: "4px 12px"
  notice-error:
    backgroundColor: "{colors.gules}"
    textColor: "{colors.on-tincture}"
    rounded: "{rounded.hairline-corner}"
    padding: "12px 16px"
---

# Design System: ARDET

## Overview

**Creative North Star: "The Wappenrolle"**

The site is a heraldic roll of arms for a building crew. Each of the five boards flies its own tincture, and heraldry's rule of tincture (metal on colour, never colour on colour) is the whole contrast system. The ground is cloth, not a dashboard panel: a near-black sable at night and warm vellum by day, both carrying a faint 4px warp-and-weft weave. Text is argent, actions are or (gold), and a board's colour shows up only as a field (pennant, banner, ribbon) or as a small escutcheon shield marking which board something belongs to.

The layout is dense and plain, because people use it mid-session next to a running game. Structure comes from 1px hairlines on a 4px grid, not from cards or shadows. The ceremony is kept to a few devices: the gilt rail of hanging pennants on Start, the swallowtail banner that unfurls over each board, the Fell display face, and the shield shape repeated at every scale from the 10px status pip to the 40px empty-state mark. Everything else is quiet UI in Atkinson Hyperlegible.

Both themes are first-class. Night is the default (no JS means night). Day keeps the same tinctures and deepens the gold so fills and focus rings still hold 3:1 on vellum.

**Key Characteristics:**
- Five fixed board tinctures (gules, purpure, vert, azure, sable). They look the same in both themes and always carry argent text.
- Or (gold) marks action: the primary button, links, focus rings, the active nav underline, the checked shield.
- Every divider is one 1px hairline. Corners are cut to 2px.
- Escutcheon and swallowtail silhouettes made with clip-path. No other ornament.
- Woven ground texture, flat surfaces, and shadows only where something hangs or floats.
- One signature motion: the pennant drop (12px, exponential ease-out).

## Colors

A sable-and-vellum ground holding five saturated heraldic fields and one gold metal. Saturation lives only in the fields; the ground and ink stay warm neutrals.

### Primary
- **Or, the Gilt Metal** ({colors.or} at night, {colors.or-day} by day): the action colour. It fills the "IP kopieren" button, outlines the IP group, colours links (by day links use the deeper {colors.link-day}), draws every focus ring, underlines the active nav link, fills the checked shield and the brand shield, tints text selection and the caret, and drains around the undo ring. Hover lifts to **Bright Or** ({colors.or-hi} / {colors.or-hi-day}). Text on or is always **Pitch** ({colors.on-or}).

### Secondary: the board tinctures
Each tincture is bound to one board through `data-tincture` and exposed as a single `--tincture` variable, so every component reads its colour from the board it belongs to.
- **Gules, Banner Red** ({colors.gules}): Bauaufgaben. Also the Owner ribbon on Staff and the error notice field.
- **Purpure, Heraldic Violet** ({colors.purpure}): Design-Vorschläge. Also the Admin ribbon.
- **Vert, Field Green** ({colors.vert}): Terraforming. Also the Bedrock edition ribbon and the Bauleitung ribbon.
- **Azure, Lapis Blue** ({colors.azure}): Zweiter Gebäudekomplex. Also the Java edition ribbon.
- **Sable Field** ({colors.sable-field}, by day {colors.sable-field-day}): the Server-Map board. Because it sits close to the night ground, sable carries an argent edge. On pennants it is a 1px `ink` drop-shadow that follows the swallowtail clip-path; on small shields it is the `rule-strong` inset ring.
- **Argent on Tincture** ({colors.on-tincture}): the only text and charge colour allowed on a tincture field.

### Tertiary: state signals
These are signals, not tinctures. They mark status and errors. They never fill a board.
- **Beacon Green** ({colors.state-on} / {colors.state-on-day}): the online pip.
- **Ember Red** ({colors.state-off} / {colors.state-off-day}): the offline or error pip (drawn as an outlined shield, while online is filled, so the state never relies on hue alone), invalid-field borders, inline field-error text, the failed-copy border, and the delete icon on hover.
- **Ash** ({colors.state-wait}): the pending pip, which breathes while status loads.

### Neutral
- **Sable Ground** ({colors.ground}) / **Vellum** ({colors.ground-day}): the page cloth, under a 4px warp (`weave`) and weft (`weave-shade`) hairline texture.
- **Raised Cloth** ({colors.ground-raised} / {colors.ground-raised-day}): the add-form well, toasts, and the hover wash on recent rows.
- **Sunk Cloth** ({colors.ground-sunk} / {colors.ground-sunk-day}): input wells, the map frame, the icon-button hover.
- **Argent Ink** ({colors.ink}) / **Iron Gall** ({colors.ink-day}): body text and titles.
- **Faded Ink** ({colors.ink-dim} / {colors.ink-dim-day}): metadata, field labels, inactive tabs and nav, placeholders.
- **Hairline** ({colors.rule}) and **Strong Hairline** ({colors.rule-strong}): every divider, and the borders of inputs, quiet buttons, and name tags. By day both are ink-based at 0.14 and 0.30 alpha.

### Named Rules
**The Rule of Tincture.** Anything laid on a tincture field (pennant, banner, ribbon, error notice) is argent ({colors.on-tincture}) or or. Tinctures are never used as text colour, and one tincture never sits on another.

**The Or Is Action Rule.** Gold means "you can press this" or "this has focus". The only static uses are the brand shield and the Regeln rule numerals. Don't use or as decoration on a surface you can't act on.

**The One Board, One Tincture Rule.** A board's colour reaches the UI only through `--tincture` bound by `data-tincture`. A new board gets a new tincture key. It never borrows a hex.

## Typography

**Display Font:** IM Fell English SC (with Iowan Old Style, Georgia, serif)
**Body Font:** Atkinson Hyperlegible (with system-ui, sans-serif)
**Label/Mono Font:** JetBrains Mono (with ui-monospace, Cascadia Mono, monospace)

**Character:** A seventeenth-century small-caps face for names and numbers paired with a legibility-first sans for everything you read or press. The Fell gives the roll its voice. Atkinson keeps it usable on a phone at night. Every display face is weight 400, because Fell only ships one.

### Hierarchy
- **Display** (400, clamp 2.75 to 4.75rem, 1.05): only the "Willkommen bei Hogwarts" hero over the castle band. Max 12ch, with a soft text shadow for legibility over the photo.
- **Headline** (400, clamp 2.25 to 3.5rem, 1.05): view titles (Regeln, Community Hub, Staff, Server-Karte).
- **Banner** (400, clamp 2 to 2.5rem, 1.05): the board name inside the tincture banner.
- **Title** (400, 1.75rem, 1.05): section titles, edition and Staff ribbons, way-onward names, and the brand wordmark (with 0.08em tracking; 1.5rem under 600px).
- **Numeral** (Atkinson 700, clamp 2.5 to 4.25rem, 1, lining tabular figures): a pennant's open count. It is not set in Fell, because Fell's old-style 1 reads as a capital I. On mobile it is a fixed 2.75rem. Regeln counters are Fell upper-roman (I, II) at 2.5rem in or, where the letterform is intended.
- **Body** (400, 1.0625rem, 1.55): all running text. Tabular numerals are on site-wide so counts and coordinates line up. Ledes run at 1.25rem with a 62ch max. Prose stays at 42 to 70ch.
- **UI Strong** (700, 0.875rem, 1): button labels, field labels, item titles (at body size), and inline error text.
- **Label** (400, 0.8125rem, uppercase, 0.08 to 0.1em tracking): only for a data term tied to its value (a pennant's "offen · erledigt" unit). Never above a heading.
- **Mono** (600, 0.92em): the server address, coordinates, dimension tags, staff names, file sizes. These are things a player types or copies, so they get a code face.

### Named Rules
**The Fell Is for Names Rule.** IM Fell English SC sets names and numbers: titles, board names, ribbons, counts. It never sets running text, buttons, form labels, or metadata.

**The Copyable Is Mono Rule.** Anything a player copies or types into the game (the IP, coordinates, player names) is set in JetBrains Mono. Nothing else is.

## Layout

The page sits in a single centred column (`page-max` 1280px) with fluid gutters (clamp 16px, 4vw, 48px) that respect safe-area insets. The map view widens to 1400px. A sticky 64px bar holds the brand shield, the live status chip, the IP group, and the theme toggle, with the main nav row beneath it. The bar is translucent ground (92%) with a 10px backdrop blur and a bottom hairline.

All spacing comes from the 4px scale (`s1` to `s16`). Controls and tap targets are 44px (`hit`). Item rows are 12px top and bottom between hairlines. View pages pad 48px above and 64px below. Lists are hairline-ruled stacks, never grids of cards.

Start runs as a 1fr | 280 to 380px split: the pennant rail on the left, "Zuletzt im Hub" on the right behind a hairline. At 1024px and below it becomes one column. At 760px and below the rail turns vertical (a gilt bar down the left edge), each pennant lays out horizontally with its swallowtail pointing right, the ways-onward strip stacks, the add form drops to two columns, and the Staff roll stacks. At 600px and below the header IP text and player count hide, leaving only the copy button. The nav and board tabs scroll sideways under 900px, with a 32px edge fade as the hint.

## Elevation & Depth

Flat by default. Depth comes from tone (raised and sunk cloth) and hairlines. Shadows appear only where an object physically hangs or floats above the cloth: the pennants and their gilt rail, the floating toast, and the error notice that interrupts the board. Night shadows are black. Day shadows are a warm umber (rgb 40 30 20) at about a third of the strength.

### Shadow Vocabulary
- **Notice** (`box-shadow: 0 2px 6px rgb(0 0 0 / 0.35)`, day `rgb(40 30 20 / 0.16)`): the gules error notice.
- **Float** (`box-shadow: 0 10px 28px rgb(0 0 0 / 0.45)`, day `rgb(40 30 20 / 0.2)`): undo toasts.
- **Hanging cloth** (`filter: drop-shadow(0 6px 10px rgb(0 0 0 / 0.3))`): each pennant, following its clipped swallowtail.
- **Gilt rail** (`box-shadow: 0 2px 4px rgb(0 0 0 / 0.35)` on a `rail-hi` → `or` → `rail-lo` gradient bar): the rod the pennants hang from.

### Named Rules
**The Nothing Floats Without Reason Rule.** A surface gets a shadow only if it hangs (pennant, rail) or floats over content (toast, error notice). Rows, forms, tabs, and panels stay flat on the cloth.

## Shapes

Corners are cut to 2px everywhere: buttons, inputs, forms, toasts, tags, thumbnails, and the map frame. The only exceptions are the pill of the gilt rail (5px), the round undo-countdown ring, and the circles inside icons. Borders are always one 1px hairline. Weight changes only on the tab and nav underlines (3px under the selected board tab, 2px under the active nav link). Dashed hairlines mean "nothing here yet" (empty board, file preview).

Two clip-path silhouettes carry the identity:
- **Escutcheon** (`polygon(0 0, 100% 0, 100% 55%, 50% 100%, 0 55%)`): the brand mark, status pip, board-tab shield, and recent-row shield. The SVG shield icon (20px grid) is the same form for the checkbox and the empty state.
- **Swallowtail.** Pennants hang with a V notch cut into the foot (`50% 86%`). Banners and ribbons fly with a notch at the fly end: 28px on the board banner, 18px on edition titles, 16px on Staff ribbons, and 24px on mobile pennants.

Tinctured cloth (pennants, banners) carries a 3px horizontal thread texture over the field.

## Components

### Buttons
Compact, bold, square-cut.
- **Shape:** 2px corners, 44px tall, 16px side padding, 700 weight at 0.875rem, icon gap 8px.
- **Or (primary):** the gold field with pitch text. Hover goes to Bright Or. Pressing moves it down 1px.
- **Quiet:** transparent with a Strong Hairline border and ink text. Hover turns the border and text to or. Used for Rückgängig, Bild, and Erneut versuchen.
- **On-field:** a quiet button sitting on a tincture field. The border is argent at 50%, and hover darkens it with a 15% black wash.
- **Icon:** a 44px square in faded ink. Hover goes to full ink over sunk cloth. A 32px small size is used for row delete (which turns ember red on hover) and image removal.
- **Disabled:** 60% opacity, not-allowed cursor.

### Copy Button
The "IP kopieren" or-button sits joined to the mono address inside a 1px or-outlined group. Its inner corners are square, and the address is in link colour at weight 600. On success the copy icon swaps for a check that draws itself in (stroke-dash, 320ms). On failure the border turns ember red.

### Status Pip
A 10×12px escutcheon (12×14px in the hero panel) in ash, beacon green, or ember red, set by `data-state`. While loading it breathes (1.2s opacity). The state is always repeated in words next to it.

### Inputs / Fields
- **Style:** a sunk-cloth well with a Strong Hairline border, 2px corners, 44px tall, 12px side padding, or caret. Labels sit above in 700 faded ink at 0.875rem. Coordinate fields use mono.
- **Hover / Focus:** hover raises the border to faded ink. Focus turns the border or and adds a 3px or glow at 30%.
- **Error:** the border turns ember red and a 700-weight ember message appears below. The message is hidden when empty.
- **Search:** a 360px max input with a faded search icon inside, 38px left padding.

### Shield Checkbox
State is shown by form as well as colour. An open item is an outlined escutcheon in faded ink. Hover outlines it in or. A done item fills the shield with or and draws a pitch check charge inside (320ms, 60ms delay). The hit area is 44px. A done item's title gets a 1px strike-through in faded ink, and its thumbnail drops to 55%.

### Item Rows
A flex row ruled by hairlines above (and below the last row): shield, an optional 56px thumbnail, title (700), a metadata line in faded ink (author, time, mono coordinates, dimension tag), and a small delete icon. New rows slide in 4px from above (320ms).

### Navigation
- **Main nav:** text links in faded ink, 44px tall, 16px padding. Hover goes to ink. The current page is ink with a 2px or underline. It scrolls sideways with snap on narrow screens.
- **Board tabs:** each tab is a 12×14px tincture shield, the board name, and a small bold count. The selected tab is ink over a 16% tincture wash with a 3px tincture underline. The row sits on a hairline.

### Pennant Rail (signature)
Five tincture pennants hang from a 10px gilt rod: a large lining numeral (open count), a tracked unit line, the board name in Fell, and a two-line "Zuletzt" preview, all in argent. On hover or focus the pennant drops 12px (`--drop`, 560ms exponential ease-out). On mobile it slides 6px sideways instead. Each pennant links to its board.

### Tincture Banner (signature)
Every board panel opens with a full-width swallowtail banner in its tincture: the board name in Fell plus the "offen · erledigt" counts in bold argent. When you switch boards it unfurls from the hoist with a clip-path reveal (560ms ease-out). The same ribbon form, smaller, titles the Beitreten editions and the Staff roles.

### Undo Toast
Deleting an entry hands it to a raised-cloth toast at the bottom right (float shadow, 2px corners). The toast has an 18px or ring that drains over the 5s undo window, the message, and a quiet "Rückgängig" button. Hover or focus pauses the countdown. The toast enters with a 12px rise and leaves with an 8px fall.

### Add Form
A raised-cloth well with a hairline border and 16px padding: a 2fr title field, a 1fr meta field, a quiet "Bild" file trigger, and the or submit, aligned to the field bottoms. On mobile it drops to two columns and the submit goes full width.

### Name Tag
A mono name in a Strong Hairline box with 2px corners (4px by 12px padding). Used on the Staff roll.

## Do's and Don'ts

### Do:
- **Do** read a board's colour from `--tincture` through `data-tincture`. Give a new board its own tincture key.
- **Do** set every word on a tincture field in argent ({colors.on-tincture}) or or. On the sable field, add the argent edge (an inset `rule-strong` ring) so it separates from the night ground.
- **Do** show state by form as well as hue: outline vs. filled shield, the pip plus a word, strike-through for done.
- **Do** divide with one 1px hairline on the 4px scale. Use dashed hairlines only for empty or pending slots.
- **Do** keep controls at 44px (`hit`) with the 2px corner.
- **Do** run motion on `--ease-out` with `--dur-1/2/3` (160, 320, 560ms) so reduced motion sets all of it to zero, including the pennant drop and the banner unfurl.
- **Do** check new colours in both themes. By day the metal is {colors.or-day} and links are {colors.link-day}.

### Don't:
- **Don't** use a tincture as text colour, and don't lay one tincture on another.
- **Don't** use or on anything that isn't an action, focus, or selection, apart from the brand shield and the rule numerals.
- **Don't** set running text, buttons, or labels in IM Fell English SC.
- **Don't** wrap rows or panels in shadowed cards. Lists stay hairline-ruled on flat cloth.
- **Don't** use tracked uppercase labels except as the term attached to a value. Never put one above a heading.
- **Don't** round corners beyond 2px on rectangular surfaces.
