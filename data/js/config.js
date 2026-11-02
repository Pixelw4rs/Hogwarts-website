// Single source of truth for addresses, timings and board metadata.
export const SERVER_ADDRESS = 'mc.ardet.de';
export const STATUS_URL = `https://api.mcsrvstat.us/3/${SERVER_ADDRESS}`;
export const MAP_URL = 'https://map.ardet.de';
export const DISCORD_URL = 'https://discord.gg/2SQccy5vT3';
export const API_BOARDS = '/api/boards';

export const STATUS_POLL_MS = 60_000;
export const HUB_POLL_MS = 5_000;
export const UNDO_MS = 5_000;
export const COPY_FEEDBACK_MS = 1_400;
export const MAX_IMAGE_BYTES = 4 * 1024 * 1024;
export const IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/gif', 'image/webp'];
export const MAX_TITLE = 200;
export const MAX_META = 100;
export const RECENT_LIMIT = 6;

export const VIEWS = [
  { id: 'start', label: 'Start', title: 'Start' },
  { id: 'regeln', label: 'Regeln', title: 'Regeln' },
  { id: 'beitreten', label: 'Beitreten', title: 'Beitreten' },
  { id: 'hub', label: 'Community Hub', title: 'Community Hub' },
  { id: 'map', label: 'Map', title: 'Server-Karte' },
  { id: 'staff', label: 'Staff', title: 'Staff' },
];
export const DEFAULT_VIEW = 'start';

export const BOARDS = [
  {
    key: 'build', label: 'Bauaufgaben', tincture: 'gules', noun: 'Aufgabe',
    titlePlaceholder: "z. B. 'Dachdetails hinzufügen'",
    metaLabel: 'Zugewiesen an', metaPlaceholder: 'optional', submit: 'Aufgabe hinzufügen',
  },
  {
    key: 'design', label: 'Design-Vorschläge', tincture: 'purpure', noun: 'Vorschlag',
    titlePlaceholder: "z. B. 'Terrakotta-Dach für die Mühle'",
    metaLabel: 'Von', metaPlaceholder: 'optional', submit: 'Vorschlag hinzufügen',
  },
  {
    key: 'terraforming', label: 'Terraforming', tincture: 'vert', noun: 'Projekt',
    titlePlaceholder: "z. B. 'Hügel bei Spawn einebnen'",
    metaLabel: 'Zugewiesen an', metaPlaceholder: 'optional', submit: 'Projekt hinzufügen',
  },
  {
    key: 'complex', label: 'Zweiter Gebäudekomplex', tincture: 'azure', noun: 'Aufgabe',
    titlePlaceholder: "z. B. 'Ecke updaten'",
    metaLabel: 'Zugewiesen an', metaPlaceholder: 'optional', submit: 'Aufgabe hinzufügen',
  },
  {
    key: 'map', label: 'Server-Map (Koordinaten)', shortLabel: 'Server-Map', tincture: 'sable', noun: 'Ort',
    titlePlaceholder: "z. B. 'Eisenfarm'",
    metaLabel: 'Koordinaten', metaPlaceholder: 'X Y Z / Dimension', submit: 'Ort hinzufügen',
    coordinates: true,
  },
];

export const BOARD_KEYS = BOARDS.map((b) => b.key);
export const boardByKey = (key) => BOARDS.find((b) => b.key === key);

export const MESSAGES = {
  offline: 'Server nicht erreichbar — Einträge können gerade nicht geladen oder gespeichert werden.',
  imageTooBig: 'Bild zu groß (max. 4 MB).',
  imageUnreadable: 'Bild konnte nicht gelesen werden.',
  imageType: 'Nur PNG, JPEG, GIF oder WebP.',
  titleMissing: 'Bitte einen Titel eingeben.',
  loading: 'Wird geladen…',
  empty: 'Noch nichts hier — füge oben den ersten Eintrag hinzu.',
  noMatches: 'Keine Einträge passen zur Suche.',
};
