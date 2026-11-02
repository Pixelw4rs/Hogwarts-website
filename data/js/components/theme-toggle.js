// Night/day switch. The inline script in index.html applies the stored theme before first paint.
import { icon } from '../lib/icons.js';

const STORAGE_KEY = 'ardet-theme';

function store(theme) {
  try { localStorage.setItem(STORAGE_KEY, theme); } catch { /* private mode: choice lasts for this visit only */ }
}

/** @param {HTMLButtonElement} button */
export function bindThemeToggle(button) {
  const root = document.documentElement;
  const meta = document.querySelector('meta[name="theme-color"]');

  function paint() {
    const light = root.dataset.theme === 'light';
    button.replaceChildren(icon(light ? 'moon' : 'sun'));
    button.setAttribute('aria-label', light ? 'Nachtmodus einschalten' : 'Tagmodus einschalten');
    button.title = button.getAttribute('aria-label');
    meta?.setAttribute('content', getComputedStyle(root).getPropertyValue('--ground').trim());
  }

  button.addEventListener('click', () => {
    root.dataset.theme = root.dataset.theme === 'light' ? 'dark' : 'light';
    store(root.dataset.theme);
    paint();
  });
  paint();
}
