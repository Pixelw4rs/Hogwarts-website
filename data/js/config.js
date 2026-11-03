// Single source of truth for addresses, timings and board metadata.
export const SERVER_ADDRESS = 'mc.ardet.de';
export const STATUS_URL = `https://api.mcsrvstat.us/3/${SERVER_ADDRESS}`;
export const MAP_URL = 'https://map.ardet.de';
export const DISCORD_URL = 'https://discord.gg/2SQccy5vT3';
export const API_BOARDS = '/api/boards';
export const API_CONTENT = '/api/content';
export const API_REQUESTS = '/api/requests';
export const API_AUTH = '/api/auth';

export const STATUS_POLL_MS = 60_000;
export const HUB_POLL_MS = 5_000;
export const UNDO_MS = 5_000;
export const COPY_FEEDBACK_MS = 1_400;
export const MAX_IMAGE_BYTES = 4 * 1024 * 1024;
export const IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/gif', 'image/webp'];
export const MAX_TITLE = 200;
export const MAX_META = 100;
export const RECENT_LIMIT = 6;
export const REQUESTS_POLL_MS = 15_000;
export const START_NEWS_LIMIT = 2;
export const CONFIRM_MS = 4_000;

/** Order matters: it is the nav order and the direction of the view transition. */
export const VIEWS = [
  { id: 'start', label: 'Start', title: 'Start' },
  { id: 'neuigkeiten', label: 'Neuigkeiten', title: 'Neuigkeiten' },
  { id: 'regeln', label: 'Regeln', title: 'Regeln' },
  { id: 'beitreten', label: 'Beitreten', title: 'Beitreten' },
  { id: 'hub', label: 'Community Hub', title: 'Community Hub' },
  { id: 'wuensche', label: 'Wünsche', title: 'Plugin- & Datapack-Wünsche' },
  { id: 'map', label: 'Map', title: 'Server-Karte' },
  { id: 'staff', label: 'Staff', title: 'Staff' },
  { id: 'admin', label: 'Admin', title: 'Admin-Bereich' },
];
/** Second hash segment each view understands (#map/live, #admin/staff …). The hub uses board keys instead. */
export const VIEW_SUBS = {
  map: ['sterne', 'live'],
  wuensche: ['plugin', 'datapack'],
  admin: ['staff', 'regeln', 'neuigkeiten'],
};
export const DEFAULT_VIEW = 'start';

export const BOARDS = [
  {
    key: 'build', label: 'Bauaufgaben', tincture: 'gules', noun: 'Aufgabe',
    titlePlaceholder: 'z. B. „Dachdetails hinzufügen“',
    metaLabel: 'Zugewiesen an', metaPlaceholder: 'optional', submit: 'Aufgabe hinzufügen',
  },
  {
    key: 'design', label: 'Design-Vorschläge', shortLabel: 'Design-Vor­schläge', tincture: 'purpure', noun: 'Vorschlag',
    titlePlaceholder: 'z. B. „Terrakotta-Dach für die Mühle“',
    metaLabel: 'Von', metaPlaceholder: 'optional', submit: 'Vorschlag hinzufügen',
  },
  {
    key: 'terraforming', label: 'Terraforming', shortLabel: 'Terra­forming', tincture: 'vert', noun: 'Projekt',
    titlePlaceholder: 'z. B. „Hügel bei Spawn einebnen“',
    metaLabel: 'Zugewiesen an', metaPlaceholder: 'optional', submit: 'Projekt hinzufügen',
  },
  {
    key: 'complex', label: 'Zweiter Gebäudekomplex', shortLabel: 'Zweiter Gebäude­komplex', tincture: 'azure', noun: 'Aufgabe',
    titlePlaceholder: 'z. B. „Ecke updaten“',
    metaLabel: 'Zugewiesen an', metaPlaceholder: 'optional', submit: 'Aufgabe hinzufügen',
  },
  {
    key: 'map', label: 'Server-Map (Koordinaten)', shortLabel: 'Server-Map', tincture: 'sable', noun: 'Ort',
    titlePlaceholder: 'z. B. „Eisenfarm“',
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
  saved: 'Gespeichert.',
  newsEmpty: 'Noch keine Neuigkeiten — schau bald wieder vorbei.',
  requestsEmpty: 'Noch keine Wünsche — sei die erste Person mit einer Idee.',
  requestsNoMatch: 'In dieser Auswahl gibt es noch keine Wünsche.',
  nameMissing: 'Bitte einen Namen eingeben.',
  linkInvalid: 'Der Link muss mit https:// beginnen.',
};

/** Heraldic tinctures an admin can give a staff role. */
export const TINCTURES = [
  { key: 'gules', label: 'Rot (Gules)' },
  { key: 'purpure', label: 'Violett (Purpure)' },
  { key: 'vert', label: 'Grün (Vert)' },
  { key: 'azure', label: 'Blau (Azure)' },
  { key: 'sable', label: 'Schwarz (Sable)' },
];

export const NEWS_TAGS = [
  { key: 'info', label: 'Info', tincture: 'sable' },
  { key: 'update', label: 'Update', tincture: 'azure' },
  { key: 'event', label: 'Event', tincture: 'purpure' },
  { key: 'wartung', label: 'Wartung', tincture: 'gules' },
];
export const newsTag = (key) => NEWS_TAGS.find((t) => t.key === key) ?? NEWS_TAGS[0];

export const REQUEST_KINDS = [
  { key: 'plugin', label: 'Plugin', plural: 'Plugins' },
  { key: 'datapack', label: 'Datapack', plural: 'Datapacks' },
];
export const REQUEST_STATUSES = [
  { key: 'open', label: 'Offen' },
  { key: 'review', label: 'Wird geprüft' },
  { key: 'accepted', label: 'Angenommen' },
  { key: 'done', label: 'Installiert' },
  { key: 'rejected', label: 'Abgelehnt' },
];
export const requestStatus = (key) => REQUEST_STATUSES.find((s) => s.key === key) ?? REQUEST_STATUSES[0];
export const requestKind = (key) => REQUEST_KINDS.find((k) => k.key === key) ?? REQUEST_KINDS[0];
