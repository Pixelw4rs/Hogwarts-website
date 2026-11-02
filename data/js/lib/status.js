// Interprets the mcsrvstat.us v3 response. Pure: no fetch, no DOM.

/** @typedef {'loading'|'online'|'offline'|'error'} StatusState */
/** @typedef {{ state: StatusState, label: string, players: string, version: string }} ServerStatus */

const DASH = '—';

/** @type {ServerStatus} */
export const LOADING_STATUS = Object.freeze({ state: 'loading', label: 'Status wird geprüft…', players: DASH, version: DASH });
/** @type {ServerStatus} */
export const ERROR_STATUS = Object.freeze({ state: 'error', label: 'Status nicht verfügbar', players: DASH, version: DASH });

/**
 * @param {unknown} data parsed JSON from the status API
 * @returns {ServerStatus}
 */
export function interpretStatus(data) {
  if (!data || typeof data !== 'object') return ERROR_STATUS;
  const d = /** @type {{ online?: boolean, players?: { online?: number, max?: number }, version?: string }} */ (data);
  if (!d.online) return { state: 'offline', label: 'Offline', players: DASH, version: DASH };
  return {
    state: 'online',
    label: 'Online',
    players: `${d.players?.online ?? DASH} / ${d.players?.max ?? DASH}`,
    version: d.version || DASH,
  };
}
