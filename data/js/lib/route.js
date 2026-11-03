// Hash routes: #start, #regeln, #hub, #hub/<board>, #map, #map/live, #wuensche/<kind>, #admin/<section> …
import { BOARD_KEYS, DEFAULT_VIEW, VIEWS, VIEW_SUBS } from '../config.js';

const VIEW_IDS = VIEWS.map((v) => v.id);

/** @typedef {{ view: string, board: string|null, sub: string|null }} Route */

/**
 * @param {string} hash e.g. "#hub/design"
 * @returns {Route}
 */
export function parseHash(hash) {
  const [view, second] = (hash || '').replace(/^#\/?/, '').split('/');
  if (!VIEW_IDS.includes(view)) return { view: DEFAULT_VIEW, board: null, sub: null };
  const board = view === 'hub' && BOARD_KEYS.includes(second) ? second : null;
  const sub = VIEW_SUBS[view]?.includes(second) ? second : null;
  return { view, board, sub };
}

/**
 * @param {{ view: string, board?: string|null, sub?: string|null }} route
 * @returns {string}
 */
export function toHash({ view, board = null, sub = null }) {
  const second = board ?? sub;
  return second ? `#${view}/${second}` : `#${view}`;
}

/** @param {string} view @returns {number} position in the nav, for the transition direction */
export const viewIndex = (view) => VIEW_IDS.indexOf(view);
