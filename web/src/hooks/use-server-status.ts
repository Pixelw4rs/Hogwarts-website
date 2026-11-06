// Live server status from mcsrvstat.us, same polling and wording as components/server-status.js.
import { useCallback, useEffect, useRef, useState } from 'react';
import { STATUS_POLL_MS, STATUS_URL } from '@legacy/config.js';
import { ERROR_STATUS, LOADING_STATUS, interpretStatus } from '@legacy/lib/status.js';

export interface ServerStatus { state: 'loading' | 'online' | 'offline' | 'error'; label: string; players: string; version: string }

export function useServerStatus() {
  const [status, setStatus] = useState<ServerStatus>(LOADING_STATUS);
  const inFlight = useRef<Promise<void> | null>(null);

  const refresh = useCallback(() => {
    // later polls swap values in place; only the first check shows the loading state
    inFlight.current ??= fetch(STATUS_URL, { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then(interpretStatus, () => ERROR_STATUS)
      .then(setStatus)
      .finally(() => { inFlight.current = null; });
    return inFlight.current;
  }, []);

  useEffect(() => {
    refresh();
    const id = setInterval(() => { if (!document.hidden) refresh(); }, STATUS_POLL_MS);
    return () => clearInterval(id);
  }, [refresh]);

  return { status, refresh };
}
