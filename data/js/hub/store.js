// Shared board state. Talks to the unchanged /api/boards contract; never touches the DOM.
import { API_BOARDS, MESSAGES } from '../config.js';

/** @typedef {import('../lib/format.js').Item} Item */
/** @typedef {{ rev: number, boards: Record<string, Item[]> }} BoardsState */
/**
 * @typedef {{
 *   rev: number, boards: Record<string, Item[]>, error: string,
 *   lastSync: number|null, pending: ReadonlySet<string>
 * }} HubSnapshot
 */

class ApiError extends Error {}

const key = (board, id) => `${board}/${id}`;

/**
 * @param {{ fetchImpl?: typeof fetch, baseUrl?: string, now?: () => number }} [deps]
 */
export function createHubStore({ fetchImpl = (...a) => fetch(...a), baseUrl = API_BOARDS, now = Date.now } = {}) {
  /** @type {HubSnapshot} */
  let snap = { rev: -1, boards: {}, error: '', lastSync: null, pending: new Set() };
  const listeners = new Set();
  /** @type {Map<string, { board: string, id: string, timer: ReturnType<typeof setTimeout> }>} */
  const deletes = new Map();

  const emit = (patch) => {
    snap = { ...snap, ...patch };
    listeners.forEach((fn) => fn(snap));
  };
  const pendingKeys = () => new Set(deletes.keys());
  const fail = (e) => emit({ error: e instanceof ApiError ? e.message : MESSAGES.offline });

  async function request(method, path, body) {
    let res;
    try {
      res = await fetchImpl(baseUrl + path, {
        method,
        cache: 'no-store',
        headers: body ? { 'Content-Type': 'application/json' } : {},
        body: body ? JSON.stringify(body) : undefined,
        keepalive: method === 'DELETE',
      });
    } catch {
      throw new ApiError(MESSAGES.offline);
    }
    if (!res.ok) {
      let message = `Fehler ${res.status}`;
      try { message = (await res.json()).error || message; } catch { /* non-JSON error body: keep status text */ }
      throw new ApiError(message);
    }
    return /** @type {Promise<BoardsState>} */ (res.json());
  }

  // Always emits, even on an unchanged rev, so a failed optimistic toggle snaps back.
  const accept = (state) => emit({ rev: state.rev, boards: state.boards, error: '', lastSync: now() });

  async function run(method, path, body) {
    try {
      accept(await request(method, path, body));
      return true;
    } catch (e) {
      fail(e);
      return false;
    }
  }

  const store = {
    /** @param {(s: HubSnapshot) => void} fn @returns {() => void} */
    subscribe(fn) {
      listeners.add(fn);
      fn(snap);
      return () => listeners.delete(fn);
    },

    /** @returns {HubSnapshot} */
    get snapshot() { return snap; },

    /** Fetches the boards; only emits when rev or error state changed. @returns {Promise<boolean>} */
    async refresh() {
      try {
        const state = await request('GET', '');
        if (state.rev === snap.rev && !snap.error) {
          snap = { ...snap, lastSync: now() };
          return true;
        }
        accept(state);
        return true;
      } catch (e) {
        fail(e);
        return false;
      }
    },

    /** @param {string} board @param {{ title: string, meta: string, image: string|null }} item @returns {Promise<boolean>} */
    add: (board, item) => run('POST', `/${board}/items`, item),

    /** @param {string} board @param {string} id @param {boolean} done @returns {Promise<boolean>} */
    toggle: (board, id, done) => run('PATCH', `/${board}/items/${id}`, { done }),

    /**
     * Hides the item now. DELETE is sent on commit(), or after `delayMs` when given.
     * @param {string} board @param {string} id @param {number|null} [delayMs]
     */
    scheduleDelete(board, id, delayMs = null) {
      const k = key(board, id);
      if (!deletes.has(k)) {
        const timer = delayMs === null ? undefined : setTimeout(() => store.commitDelete(board, id), delayMs);
        deletes.set(k, { board, id, timer });
        emit({ pending: pendingKeys() });
      }
      return { undo: () => store.undoDelete(board, id), commit: () => store.commitDelete(board, id) };
    },

    /** @param {string} board @param {string} id */
    undoDelete(board, id) {
      const entry = deletes.get(key(board, id));
      if (!entry) return;
      clearTimeout(entry.timer);
      deletes.delete(key(board, id));
      emit({ pending: pendingKeys() });
    },

    /** @param {string} board @param {string} id @returns {Promise<boolean>} */
    async commitDelete(board, id) {
      const entry = deletes.get(key(board, id));
      if (!entry) return true;
      clearTimeout(entry.timer);
      deletes.delete(key(board, id));
      const ok = await run('DELETE', `/${board}/items/${id}`);
      emit({ pending: pendingKeys() });
      return ok;
    },

    /** Sends every pending delete now (page hidden or closing). */
    flushDeletes() {
      return Promise.all([...deletes.values()].map(({ board, id }) => store.commitDelete(board, id)));
    },

    /** @param {string} board @returns {Item[]} items minus ones waiting to be deleted */
    visibleItems(board) {
      return (snap.boards[board] || []).filter((i) => !snap.pending.has(key(board, i.id)));
    },

    /** @param {string} message */
    setError(message) { emit({ error: message }); },
    clearError() { if (snap.error) emit({ error: '' }); },
  };
  return store;
}
