// Ambient pointer layer from the rootless kit: a gilt blob cursor, a gold ripple at every press
// (always 120px, the same on controls and on the empty page), and the hero title's letters, which zoom in and
// then drift away from the pointer. Off entirely under reduced motion; the cursor is off on touch
// devices. The kit's background dot field is not used.
import { RootlessAnimations } from '../lib/rootless-animations.js';
import { prefersReducedMotion } from '../lib/dom.js';

const root = document.documentElement;

// The cursor follows the page's action colour (--or), read once per theme switch rather than per frame.
// Plain rgba() because the cursor is drawn on a canvas, where not every browser takes color-mix().
let accent = '#d4a23c';
let rgb = '212, 162, 60';
function readAccent() {
  const hex = getComputedStyle(root).getPropertyValue('--or').trim();
  if (!/^#[0-9a-f]{6}$/i.test(hex)) return;
  accent = hex;
  rgb = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)).join(', ');
}
const tint = (alpha) => `rgba(${rgb}, ${alpha / 100})`;

const CONTROLS = 'a, button, label, select, summary, input, textarea, [role="tab"], .pennant, [data-ra-hover]';
// Every press gets the same ripple, whatever was pressed: the size a click on the empty page gets.
const RIPPLE_SIZE = 120;
const rippleDiameter = () => RIPPLE_SIZE;

/**
 * Splits the hero title into letter spans, one nowrap group per word so lines only break between
 * words. The heading keeps its text as aria-label; the spans are hidden from assistive tech.
 * @param {HTMLElement} title
 * @returns {boolean} whether the title was split
 */
function splitHeroTitle(title) {
  const text = title.textContent.trim();
  if (!text) return false;
  title.setAttribute('aria-label', text);
  let i = 0;
  const parts = text.split(/\s+/).flatMap((word, w) => {
    const group = document.createElement('span');
    group.className = 'hero-word';
    group.setAttribute('aria-hidden', 'true');
    for (const ch of word) {
      const span = document.createElement('span');
      span.className = 'ra-char';
      span.style.setProperty('--delay', `${(i++ * 0.045).toFixed(3)}s`);
      span.textContent = ch;
      group.append(span);
    }
    return w === 0 ? [group] : [document.createTextNode(' '), group];
  });
  const caret = document.createElement('span');
  caret.className = 'ra-caret';
  caret.setAttribute('aria-hidden', 'true');
  title.replaceChildren(...parts, caret);
  title.classList.add('is-split');
  return true;
}

export function startAmbient() {
  if (prefersReducedMotion()) return;
  const title = /** @type {HTMLElement|null} */ (document.querySelector('.hero-title'));
  const split = title ? splitHeroTitle(title) : false;
  root.setAttribute('data-ambient', '');
  readAccent();
  new MutationObserver(readAccent).observe(root, { attributes: true, attributeFilter: ['data-theme'] });

  RootlessAnimations.init({
    cursorOnTouch: false,
    hoverSelector: CONTROLS,
    cursorFill: () => tint(18),
    cursorStroke: () => accent,
    rippleColor: tint(22),
    rippleSize: rippleDiameter,
    particles: false,
    letters: split ? '.hero-title .ra-char' : null,
  });
}
