// Hash routes: #start, #regeln, #beitreten, #hub, #hub/<board>, #map, #staff.
import { BOARD_KEYS, DEFAULT_VIEW, VIEWS } from '../config.js';

const VIEW_IDS = VIEWS.map((v) => v.id);

/** @typedef {{ view: string, board: string|null }} Route */

/**
 * @param {string} hash e.g. "#hub/design"
 * @returns {Route}
 */
export function parseHash(hash) {
  const [view, board] = (hash || '').replace(/^#\/?/, '').split('/');
  if (!VIEW_IDS.includes(view)) return { view: DEFAULT_VIEW, board: null };
  if (view === 'hub' && BOARD_KEYS.includes(board)) return { view, board };
  return { view, board: null };
}

/**
 * @param {Route} route
 * @returns {string}
 */
export function toHash({ view, board }) {
  return board ? `#${view}/${board}` : `#${view}`;
}
