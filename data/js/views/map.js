// Live map iframe, loaded only the first time the Map view opens.
import { $ } from '../lib/dom.js';

export function createMapView() {
  const frame = /** @type {HTMLIFrameElement} */ ($('#mapFrame'));
  const box = /** @type {HTMLElement} */ (frame.parentElement);
  return {
    load() {
      if (frame.getAttribute('src')) return;
      box.dataset.state = 'loading';
      frame.addEventListener('load', () => { box.dataset.state = 'ready'; }, { once: true });
      frame.src = frame.dataset.src;
    },
  };
}
