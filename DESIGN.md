---
name: ARDET
description: Coordination home for the ARDET Minecraft server's Hogwarts build, drawn as rounded live widgets in a castle-at-dusk palette.
colors:
  sand: "#f2dcb4"
  sea-pine: "#4c6b68"
  slate: "#2a3d3f"
  deep: "#162222"
  ember: "#e0773f"
  or: "#e8bd7e"
  or-hi: "#f3cf98"
  on-or: "#182222"
  ground: "#162222"
  surface: "#1c2a2a"
  surface-2: "#243535"
  surface-sunk: "#101a1a"
  ink: "#f3e5cb"
  ink-dim: "#a7b7b0"
  line: "rgb(243 229 203 / 0.09)"
  line-strong: "rgb(243 229 203 / 0.18)"
  state-on: "#78c59a"
  state-off: "#e8774f"
  state-wait: "#8c9c97"
  gules: "#8e4632"
  purpure: "#5b4a66"
  vert: "#3f6660"
  azure: "#3c5a6e"
  sable-field: "#263434"
  on-tincture: "#f7e8cc"
  or-day: "#2f5451"
  or-hi-day: "#3d6763"
  on-or-day: "#f7e8cc"
  link-day: "#2b5a55"
  ground-day: "#f3e2c4"
  surface-day: "#faf1e0"
  surface-2-day: "#f1e0c3"
  surface-sunk-day: "#e9d4b1"
  ink-day: "#1c2b2b"
  ink-dim-day: "#4a5f5c"
  state-on-day: "#22804f"
  state-off-day: "#b2482a"
typography:
  display:
    fontFamily: "Bricolage Grotesque, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(2.75rem, 1.4rem + 5vw, 5.5rem)"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Bricolage Grotesque, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(2.25rem, 1.6rem + 2.4vw, 3.5rem)"
    fontWeight: 700
    lineHeight: 1.05
    letterSpacing: "-0.025em"
  title:
    fontFamily: "Bricolage Grotesque, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.75rem"
    fontWeight: 700
    lineHeight: 1.05
  numeral:
    fontFamily: "Bricolage Grotesque, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(2.5rem, 1.9rem + 2vw, 3.75rem)"
    fontWeight: 700
    lineHeight: 1
  body:
    fontFamily: "Atkinson Hyperlegible Next, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.55
    fontFeature: "tnum"
  ui-strong:
    fontFamily: "Atkinson Hyperlegible Next, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 700
    lineHeight: 1
  mono:
    fontFamily: "Atkinson Hyperlegible Mono, ui-monospace, Cascadia Mono, monospace"
    fontSize: "0.94em"
    fontWeight: 600
  atlas:
    fontFamily: "Spectral, Iowan Old Style, Georgia, serif"
    fontSize: "1.5rem"
    fontWeight: 300
    fontStyle: "italic"
rounded:
  sm: "10px"
  field: "12px"
  md: "16px"
  lg: "24px"
  pill: "999px"
spacing:
  s1: "4px"
  s2: "8px"
  s3: "12px"
  s4: "16px"
  s6: "24px"
  s8: "32px"
  hit: "44px"
  page-max: "1280px"
  gutter: "clamp(16px, 4vw, 48px)"
components:
  button-or:
    backgroundColor: "{colors.or}"
    textColor: "{colors.on-or}"
    typography: "{typography.ui-strong}"
    rounded: "{rounded.pill}"
    padding: "0 18px"
    height: "44px"
  button-quiet:
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    height: "44px"
  button-icon:
    textColor: "{colors.ink-dim}"
    rounded: "{rounded.pill}"
    size: "44px"
  input:
    backgroundColor: "{colors.surface-sunk}"
    textColor: "{colors.ink}"
    rounded: "{rounded.field}"
    padding: "0 14px"
    height: "44px"
  card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.md}"
    padding: "24px"
  board-widget:
    textColor: "{colors.on-tincture}"
    rounded: "6px 6px 16px 16px"
    padding: "18px 18px 20px"
    height: "236px"
  board-banner:
    textColor: "{colors.on-tincture}"
    rounded: "{rounded.lg}"
    padding: "22px 28px"
  header-island:
    rounded: "{rounded.pill}"
  toast:
    backgroundColor: "{colors.surface-2}"
    rounded: "{rounded.md}"
    padding: "8px 8px 8px 16px"
---

# Design System: ARDET

## Overview

**Creative North Star: "Castle at Dusk"**

The site is a small set of rounded, live widgets laid over a castle at dusk: moonlit sand above, sea-pine and slate teal below, and the ember of lit windows as the one warm signal. It is a working tool used mid-session next to a running game, often at night, so the look stays calm and the controls stay obvious. The identity comes from three things: the palette, the board widgets hanging from a gilt rail on Start, and the motion layer carried over from the earlier "Wappenrolle" design.

Colour never switches hard between the two poles. Every surface sits on a tonal ramp (sunk, ground, surface, raised), the page backdrop is a soft moonlit gradient, and the board fields and banner shade from a sand-tinted edge into a deeper teal-tinted one. "Not binary" is the rule.

Night is the default (no stored choice means night). Day is a sand parchment ground with deep-teal ink and a sea-pine action colour. Both themes are first-class and share the board fields.

**Key characteristics**
- Rounded everything: pills for controls, chips and tabs; 16px cards; 24px for the hero frame, the board banner and large panels.
- One action colour (`--or`): sand-gold at night, sea-pine by day. It marks buttons, links, focus, the sliding tab bar, the rail and the cursor.
- Five muted board fields in one lightness band, always carrying sand text.
- Floating island header; surfaces separated by tone and a faint line, with shadows only on things that float or hang.
- The motion layer from before, unchanged except the board-card hover.

## Colors

### Poles
- **Moonlit Sand** (`#f2dcb4`): the highlight pole. Night ink is a lighter sand (`#f3e5cb`), the night action colour is sand-gold (`#e8bd7e`), and every field's top edge is mixed toward sand.
- **Sea Pine** (`#4c6b68`) and **Slate** (`#2a3d3f`): the middle of the ramp; the day action colour is a deep sea-pine (`#2f5451`).
- **Deep Teal** (`#162222`): the night ground and the dark end every field shades into.
- **Ember** (`#e0773f`): the lit-window accent. It is the offline/error signal and the "picked" torch on the star chart. It is never decoration.

### Action (`--or`)
Night `#e8bd7e` with pitch-teal text (`#182222`), hover `#f3cf98`. Day `#2f5451` with sand text (`#f7e8cc`), hover `#3d6763`, links `#2b5a55`. Focus rings, the sliding nav/tab bar, the gilt rail, text selection, the caret, the cursor blob and click ripples all read `--or`, so the whole UI changes with the theme.

### Board fields
Bound per board through `data-tincture` and exposed as `--tincture`; identical in both themes:
- **Rust** `#8e4632`: Bauaufgaben; also the error notice and the armed delete button.
- **Dusk Plum** `#5b4a66`: Design-Vorschläge.
- **Sea Pine** `#3f6660`: Terraforming.
- **Slate Blue** `#3c5a6e`: Zweiter Gebäudekomplex.
- **Deep Teal** `#263434`: Server-Map; gets a `line-strong` inset ring so it separates from the night ground.

News tags, staff roles and the edition chips reuse the same five fields.

### Neutrals
Night: ground `#162222`, surface `#1c2a2a`, raised `#243535`, sunk `#101a1a`, ink `#f3e5cb`, faded ink `#a7b7b0`, lines at 9% and 18% sand. Day: ground `#f3e2c4`, surface `#faf1e0`, raised `#f1e0c3`, sunk `#e9d4b1`, ink `#1c2b2b`, faded ink `#4a5f5c`, lines at 10% and 20% teal.

### States
Online `#78c59a` (day `#22804f`) as a filled dot with a soft halo; offline/error ember as an outlined ring, so state never relies on hue alone; pending ash `#8c9c97`, breathing while it loads. The state is always repeated in words.

### Rules
- **Sand on fields.** Text on a board field, banner, chip or the error notice is sand (`--on-tincture`). A field is never used as a text colour.
- **Action is one colour.** Only `--or` means "press this" or "this has focus".
- **One board, one field.** A board's colour comes only through `--tincture`; a new board gets a new key.
- **No hard splits.** Large areas blend between poles with gradients or tonal steps, never a flat two-tone cut.

## Typography

- **Display and titles:** Bricolage Grotesque 700 with tight tracking (-0.02 to -0.035em). The hero "Willkommen bei Hogwarts" runs `clamp(2.75rem, 1.4rem + 5vw, 5.5rem)`, view headlines `clamp(2.25rem, 1.6rem + 2.4vw, 3.5rem)`, section titles 1.375 to 1.75rem. Board counts are Bricolage numerals.
- **Body and UI:** Atkinson Hyperlegible Next. Body 1.0625rem / 1.55 with tabular figures site-wide; ledes 1.1875rem, max 62ch; labels and buttons 700 at 0.875rem.
- **Copyable:** Atkinson Hyperlegible Mono 600 for the server address, coordinates, player names and file sizes, the things a player types into the game. Nothing else is mono.
- **Star chart:** Spectral italic 300 for place names on the Sternkarte.

## Layout

A single centred column (`page-max` 1280px, gutters `clamp(16px, 4vw, 48px)`); the Map widens to 1400px. The header is two floating pill islands: brand on the left and status, IP and icons on the right, with the nav island in a second row underneath. The bar is translucent ground with a 24px backdrop blur and a soft float shadow.

Start: a rounded castle hero frame (24px), then a `1fr | 300–380px` grid of the board rail and the "Zuletzt im Hub" card, then news cards and three link cards. Content pages (Neuigkeiten, Regeln, Beitreten, Staff, Wünsche) are stacks of 16px cards with 10–20px gaps. Controls and tap targets are 44px. The nav and tab rows scroll sideways under 900px with a 32px edge fade.

## Elevation

Surfaces separate by tone plus a faint 1px line. Shadows are for things that float or hang:
- **Float** (`0 18px 40px -12px` deep teal, plus a 1px inner highlight): the header islands, toasts, the login card.
- **Hang** (`0 12px 22px -12px`): board widgets, the board banner, the error notice, the map frame; **Hang-hi** on hover.
Day shadows use slate teal at about half the strength.

## Components

- **Buttons:** pills, 44px, 700 weight. Or: action fill with a gilt sheen on hover. Quiet: line-strong border that turns to the action colour. On-field: translucent sand outline on a board field. Icon: 44px round, faded ink, raised on hover. Small: 32px (44px on touch).
- **Copy address:** a sunk pill holding the mono address and the or button. Copying swaps the icon for a drawn check, and a gold ring settles onto the group.
- **Fields:** sunk wells, 12px corners, 44px, line-strong border; hover lifts the border, focus turns it `--or` with a 3px ring at 30%. Search and the small selects are pills. Errors: ember border plus a bold ember line.
- **Done check:** a 24px rounded box (8px corners). Open is an outline; done fills with `--or`, draws the check and is stamped (scale 1.22 → 1). Done titles get a 1px strike-through.
- **Item rows:** rounded rows (16px) that wash to surface on hover; optional 56px thumbnail with 12px corners; coordinates as mono with a dimension pill and a copy button.
- **Tabs:** board and filter tabs are pills with a dot in the board field; the selected board tab gets a 22% field wash. One sliding bar (3px, rounded) moves under the active tab with a spring.
- **Board widget (Start):** a field card hanging from a 6px gilt pill rail, corners 6px at the rod and 16px at the foot, field gradient from sand-tinted to teal-tinted, a soft radial sheen. Shows the rolling count, "offen · n erledigt", the board name and the latest entry.
- **Board banner (Hub):** a 24px rounded field bar with the board name and counts, unfurling from the left when the board opens.
- **Cards (21st.dev "Stats cards with links" primitives):** surface, 1px line, 16px corners; used for recent, news teasers, ways onward, posts, rules, editions, staff rows and wishes.
- **Undo toast:** raised surface, 16px, float shadow; an 18px ring drains over the 5s undo window and pauses on hover or focus.
- **Wish row:** a 52×56 vote box (14px corners; or wash when voted), name, kind and status pills, the team's answer in a tinted inset.
- **Login card:** surface, 24px corners, float shadow, a 44px or tile as the mark, and the show-password toggle inside the field.
- **Sternkarte:** the star chart stays a night plate in both themes, now deep teal (`#0f1c1d` → `#152728`) with sand chalk, sage grid lines and an ember torch for the picked place; it sits in a 24px rounded panel.

## Motion

The motion layer is `data/css/motion.css` plus the `data/js` helpers, imported unchanged by the React app. Durations 160 / 320 / 560ms on an exponential ease-out (`cubic-bezier(0.16, 1, 0.3, 1)`), a slight spring for the tab bar and star rise.
- **Page switch:** the new view slides 40px from the direction of travel as a keyframe on the live page (no View Transition, so the cursor never freezes).
- **Sliding indicator** under the nav, board tabs, filter tabs and admin tabs; tabs preview it with a hairline drawn from the centre.
- **Scroll reveal:** rows rise 18px, cards unroll from the top edge, board widgets unfurl from the rail, staggered 70ms.
- **Rolling numbers** for board counts and votes.
- **Board widget hover:** a 4px lift in 220ms with a deeper shadow and a brighter sheen; 1px when pressed. (The old 12px drop and cloth swing were removed on request.)
- **Feedback:** stamp on done, squeeze on vote, gold ring on copy, focus rings settling in from 7px, the status dot striking once when the server comes online, gilt sheen on or buttons.
- **Theme switch:** the new theme is lowered from the top (View Transition clip, 560ms) and the sun/moon turns over; the cursor and ripples stay live on top.
- **Ambient pointer:** a blob cursor and click ripples in `--or`, and hero letters that zoom in from a blur and drift away from the pointer. Off under reduced motion; the cursor is off on touch.
- **Reduced motion** zeroes all durations and turns off reveals, swings, the ambient layer and the star twinkle; content is hidden for a reveal only after JS has set `data-reveal-on`.

## Do's and Don'ts

### Do
- Use the tonal ramp and gradients between sand and teal for large areas.
- Read a board's colour from `--tincture`; give a new board its own key.
- Keep controls at 44px, pills for controls, 16px for cards, 24px for heroes and banners.
- Show state by form and words as well as hue (filled vs. outlined dot, strike-through for done).
- Check every new colour in both themes; the action colour flips from sand-gold to sea-pine.
- Import motion from the shared layer instead of re-implementing it in components.

### Don't
- Don't put text in a board colour or lay one field on another.
- Don't use `--or` for anything that is not an action, focus or selection.
- Don't cut the page into flat sand and teal blocks.
- Don't add shadows to rows, forms or tabs; only floating and hanging things get one.
- Don't use mono for anything a player wouldn't type or copy.
