// Admin-Bereich (#admin): login card, then Staff / Regeln / Neuigkeiten editors.
// Requests are moderated inline on the Wünsche page while signed in.
import { announce } from '../components/announcer.js';
import { attachIndicator } from '../components/indicator.js';
import { $, $$, el } from '../lib/dom.js';
import { icon } from '../lib/icons.js';
import { createRulesEditor, createStaffEditor } from './editors.js';
import { createNewsEditor } from './news-editor.js';

const SECTIONS = ['staff', 'regeln', 'neuigkeiten'];

function createLoginForm(auth) {
  const user = el('input', { id: 'login-user', name: 'username', autocomplete: 'username', autocapitalize: 'none', spellcheck: 'false', required: true });
  const pass = el('input', { id: 'login-pass', name: 'password', type: 'password', autocomplete: 'current-password', required: true, 'aria-describedby': 'login-error' });
  const reveal = el('button', { class: 'btn btn-icon pass-toggle', type: 'button', 'aria-label': 'Passwort anzeigen', 'aria-controls': 'login-pass', 'aria-pressed': 'false' }, icon('eye'));
  const error = el('p', { id: 'login-error', class: 'field-error', role: 'alert' });
  const label = el('span', { text: 'Anmelden' });
  const submit = el('button', { class: 'btn btn-or btn-block', type: 'submit' }, icon('key'), label);

  reveal.addEventListener('click', () => {
    const show = pass.type === 'password';
    pass.type = show ? 'text' : 'password';
    reveal.setAttribute('aria-pressed', String(show));
    reveal.setAttribute('aria-label', show ? 'Passwort verbergen' : 'Passwort anzeigen');
    reveal.replaceChildren(icon(show ? 'eyeOff' : 'eye'));
  });

  const form = el('form', { class: 'login-card', novalidate: true, 'aria-labelledby': 'login-title' },
    el('span', { class: 'login-mark', 'aria-hidden': 'true' }),
    el('h2', { class: 'login-title', id: 'login-title', text: 'Admin-Anmeldung' }),
    el('p', { class: 'login-lede', text: 'Nur für das Team. Hier pflegst du Staff, Regeln und Neuigkeiten.' }),
    el('div', { class: 'field' }, el('label', { for: 'login-user', text: 'Benutzername' }), user),
    el('div', { class: 'field' }, el('label', { for: 'login-pass', text: 'Passwort' }), el('div', { class: 'pass-wrap' }, pass, reveal)),
    error,
    submit,
  );

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!user.value.trim() || !pass.value) {
      error.textContent = 'Bitte Benutzername und Passwort eingeben.';
      (user.value.trim() ? pass : user).focus();
      return;
    }
    submit.disabled = true;
    label.textContent = 'Wird angemeldet…';
    const result = await auth.send('POST', '/login', { username: user.value.trim(), password: pass.value });
    submit.disabled = false;
    label.textContent = 'Anmelden';
    if (!result.ok) {
      error.textContent = result.error;
      pass.select();
      pass.focus();
      return;
    }
    pass.value = '';
    error.textContent = '';
    announce(`Angemeldet als ${auth.snapshot.data?.user ?? ''}`);
  });
  return { el: form, focus: () => user.focus() };
}

/**
 * @param {ReturnType<typeof import('../lib/resource.js').createResource>} auth
 * @param {ReturnType<typeof import('../lib/resource.js').createResource>} content
 * @param {{ onAuthChange: () => void }} hooks
 */
export function mountAdmin(auth, content, { onAuthChange }) {
  const loginSlot = $('#admin-login');
  const panel = $('#admin-panel');
  const who = $('#admin-who');
  const notConfigured = $('#admin-unconfigured');
  const tabs = $$('[data-admin-tab]');
  const login = createLoginForm(auth);
  loginSlot.replaceChildren(login.el);

  const editors = { staff: createStaffEditor(content), regeln: createRulesEditor(content), neuigkeiten: createNewsEditor(content) };
  for (const key of SECTIONS) $(`#admin-${key}`).replaceChildren(editors[key].el);
  const indicator = attachIndicator($('#admin-tabs'), () => tabs.find((t) => t.getAttribute('aria-current') === 'page') ?? null, { class: 'indicator-or' });

  $('#admin-logout').addEventListener('click', async () => {
    await auth.send('POST', '/logout', {});
    announce('Abgemeldet');
  });

  content.subscribe((snap) => {
    if (!snap.data) return;
    editors.staff.load(snap.data.staff);
    editors.regeln.load(snap.data.rules);
    editors.neuigkeiten.load(snap.data.news);
  });

  let wasUser = null;
  auth.subscribe((snap) => {
    const user = snap.data?.user ?? null;
    document.documentElement.toggleAttribute('data-admin', Boolean(user));
    loginSlot.hidden = Boolean(user);
    panel.hidden = !user;
    notConfigured.hidden = snap.data?.configured !== false;
    who.replaceChildren('Angemeldet als ', el('b', { translate: 'no', text: user ?? '' }));
    if (user !== wasUser) {
      wasUser = user;
      onAuthChange();
      indicator.update();
    }
  });

  let section = 'staff';
  return {
    /** @param {string|null} sub */
    show(sub) {
      const next = SECTIONS.includes(sub) ? sub : 'staff';
      if (next !== section) $(`#admin-${next}`).dataset.enter = SECTIONS.indexOf(next) > SECTIONS.indexOf(section) ? 'forward' : 'back';
      section = next;
      for (const t of tabs) {
        if (t.dataset.adminTab === next) t.setAttribute('aria-current', 'page');
        else t.removeAttribute('aria-current');
      }
      for (const key of SECTIONS) $(`#admin-${key}`).hidden = key !== next;
      indicator.update();
    },
    focusLogin() { if (!auth.snapshot.data?.user) login.focus(); },
    /** @returns {boolean} true while any editor holds unsaved changes */
    get dirty() { return SECTIONS.some((k) => editors[k].dirty); },
  };
}
