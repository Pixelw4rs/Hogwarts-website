// Scroll reveal: elements with [data-reveal] roll in once when they enter the viewport.
// CSS owns the look (see motion.css); this only flips data-revealed. Under reduced motion,
// or without IntersectionObserver, everything is revealed at once.
import { prefersReducedMotion } from '../lib/dom.js';

const STAGGER_LIMIT = 8;

let observer = null;
function getObserver() {
  observer ??= new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.setAttribute('data-revealed', '');
      observer.unobserve(entry.target);
    }
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
  return observer;
}

/**
 * Starts watching every not-yet-revealed [data-reveal] inside `root`. Safe to call after each render.
 * Siblings get a stagger index (--i) so a list rolls in one after another.
 * @param {ParentNode} [root]
 */
export function reveal(root = document) {
  const nodes = [...root.querySelectorAll('[data-reveal]:not([data-revealed])')];
  if (!('IntersectionObserver' in window) || prefersReducedMotion()) {
    nodes.forEach((n) => n.setAttribute('data-revealed', ''));
    return;
  }
  // CSS only hides [data-reveal] once this flag is set, so content never stays invisible if JS fails
  document.documentElement.setAttribute('data-reveal-on', '');
  const seen = new Map();
  for (const node of nodes) {
    const parent = node.parentElement;
    const i = seen.get(parent) ?? 0;
    seen.set(parent, i + 1);
    node.style.setProperty('--i', String(Math.min(i, STAGGER_LIMIT)));
    getObserver().observe(node);
  }
}
