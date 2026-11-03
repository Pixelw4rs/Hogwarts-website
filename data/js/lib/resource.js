// A JSON resource on the API (content, requests, auth): load, subscribe, write. Never touches the DOM.
import { MESSAGES } from '../config.js';

/** @template T @typedef {{ data: T|null, error: string, loading: boolean }} ResourceSnapshot */

class ApiError extends Error {
  /** @param {string} message @param {number} status */
  constructor(message, status) { super(message); this.status = status; }
}

/**
 * @template T
 * @param {string} baseUrl
 * @param {{ fetchImpl?: typeof fetch, readPath?: string }} [deps] readPath: sub path refresh() GETs (auth reads /me)
 */
export function createResource(baseUrl, { fetchImpl = (...a) => fetch(...a), readPath = '' } = {}) {
  /** @type {ResourceSnapshot<T>} */
  let snap = { data: null, error: '', loading: true };
  const listeners = new Set();
  const emit = (patch) => {
    snap = { ...snap, ...patch };
    listeners.forEach((fn) => fn(snap));
  };

  async function request(method, path, body) {
    let res;
    try {
      res = await fetchImpl(baseUrl + path, {
        method,
        cache: 'no-store',
        credentials: 'same-origin',
        headers: body === undefined ? {} : { 'Content-Type': 'application/json' },
        body: body === undefined ? undefined : JSON.stringify(body),
      });
    } catch {
      throw new ApiError(MESSAGES.offline, 0);
    }
    if (!res.ok) {
      let message = `Fehler ${res.status}`;
      try { message = (await res.json()).error || message; } catch { /* non-JSON error body: keep status text */ }
      throw new ApiError(message, res.status);
    }
    return res.json();
  }

  return {
    /** @param {(s: ResourceSnapshot<T>) => void} fn @returns {() => void} */
    subscribe(fn) {
      listeners.add(fn);
      fn(snap);
      return () => listeners.delete(fn);
    },
    get snapshot() { return snap; },

    /** @returns {Promise<boolean>} */
    async refresh() {
      try {
        emit({ data: await request('GET', readPath), error: '', loading: false });
        return true;
      } catch (e) {
        emit({ error: e.message, loading: false });
        return false;
      }
    },

    /**
     * Writes and adopts the returned state. Errors are returned, not stored, so a failed
     * admin save does not blank the public view.
     * @param {string} method @param {string} path @param {unknown} [body]
     * @returns {Promise<{ ok: true, error: '' } | { ok: false, error: string, status: number }>}
     */
    async send(method, path, body) {
      try {
        emit({ data: await request(method, path, body), error: '', loading: false });
        return { ok: true, error: '' };
      } catch (e) {
        return { ok: false, error: e.message, status: e.status };
      }
    },

    /** Replaces the data locally (e.g. after logout). @param {T|null} data */
    set(data) { emit({ data }); },
  };
}
