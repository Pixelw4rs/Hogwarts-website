// Small bridges that hand a React-rendered node to a data/js motion helper exactly once.
import { useEffect, useRef, type RefObject } from 'react';

const bound = new WeakSet<Element>();

/** Runs `bind(node)` once per DOM node (safe under StrictMode's double effects). */
export function useBindOnce<T extends Element>(bind: (node: T) => void): RefObject<T | null> {
  const ref = useRef<T>(null);
  useEffect(() => {
    const node = ref.current;
    if (!node || bound.has(node)) return;
    bound.add(node);
    bind(node);
  }, [bind]);
  return ref;
}
