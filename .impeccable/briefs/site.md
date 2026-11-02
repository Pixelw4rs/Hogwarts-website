# Surface brief — ARDET site (all views)

Mode: **Operate** (players coordinating builds). Code-led build.

## Direction contract

THESIS: Every board flies its own tincture. Heraldry's rule of tincture (a metal on a colour, never colour on colour) is the contrast system, and it refuses the category default: a grey Discord-style dashboard with one blurple accent.

OWN-WORLD: The ground is sable #141116 with a faint woven-banner texture; text is argent #ECE6DA; actions are or (gold) #D4A23C. The board tinctures are gules (Bauaufgaben), purpure (Design), vert (Terraforming), azure (Gebäudekomplex) and sable with an argent edge (Map). Pennants have swallowtail ends. Checkboxes are escutcheon shields: outlined when open, filled gold when done. All dividers are 1px hairlines on a 4px grid. Type is IM Fell English SC for display only, Atkinson Hyperlegible for the UI, and JetBrains Mono for coordinates and the IP.

STORY: Players see at a glance that the server is up and copy the IP. They see which board has open work, enter it in one tap, then add, tick or remove entries, and trust that everyone sees the same board.

FIRST VIEWPORT: A sticky 64px bar holds the brand shield, the live status and an IP + "IP kopieren" button. Tabs sit below it. On Start: the castle image band with "Willkommen bei Hogwarts" in Fell at about 76px, then a gilt rail from which 5 pennants hang (open count as the large numeral). A "Zuletzt im Hub" list sits on the right on desktop and below the rail on mobile. The pennants are the primary action and lead to their board.

FORM: Wappenrolle (heraldic roll of arms), candidate 7 on my ordered list (assigned by the roll). seed:8d28c46511bbf272

Raises: state is shown by form, not just hue (shield outline vs filled) — from emission-line rail. Nothing disappears silently: a deleted row is held back and a „… entfernt“ toast offers 5s of Rückgängig before the DELETE is sent — from ticket wallet. One rule weight on a 4px grid — from design annual.

Signature motion: the pennant drop. The active or hovered pennant lowers 12px with an exponential ease-out, and switching boards unfurls the board's banner header with a clip-path reveal. Both turn off under reduced motion.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
