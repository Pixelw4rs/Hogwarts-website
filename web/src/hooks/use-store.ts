import { useSyncExternalStore } from 'react';

/** Any data/js store or resource: subscribe(fn) calls fn now and on every change, snapshot is the current state. */
interface Subscribable<T> {
  subscribe(fn: (s: T) => void): () => void;
  readonly snapshot: T;
}

export function useStore<T>(store: Subscribable<T>): T {
  return useSyncExternalStore(
    (onChange) => store.subscribe(() => onChange()),
    () => store.snapshot,
  );
}
