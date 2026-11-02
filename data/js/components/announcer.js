// One polite live region for short confirmations ("IP kopiert", "Eintrag entfernt").
let region;

/** @param {string} message */
export function announce(message) {
  region ??= document.getElementById('announcer');
  if (!region) return;
  region.textContent = '';
  // next frame so screen readers register the change even for repeated messages
  requestAnimationFrame(() => { region.textContent = message; });
}
