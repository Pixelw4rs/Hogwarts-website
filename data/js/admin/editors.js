// The Regeln and Staff editors: field rows plugged into the generic list editor.
import { TINCTURES } from '../config.js';
import { el } from '../lib/dom.js';
import { createListEditor } from './list-editor.js';

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII', 'XIV', 'XV', 'XVI', 'XVII', 'XVIII', 'XIX', 'XX'];
const numeral = (i) => ROMAN[i] ?? String(i + 1);
let uid = 0;

/** @param {ReturnType<typeof import('../lib/resource.js').createResource>} content */
export function createRulesEditor(content) {
  return createListEditor({
    title: 'Regeln',
    addLabel: 'Regel hinzufügen',
    itemName: (i) => `Regel ${numeral(i)}`,
    hint: el('p', { class: 'editor-hint' }, 'Link einfügen mit ', el('code', { text: '[Text](#hub/terraforming)' }), ' oder ', el('code', { text: '[Text](https://…)' }), '. Leere Regeln werden beim Speichern entfernt.'),
    blank: () => ({ id: '', text: '' }),
    makeRow(rule, i, onChange) {
      const id = `rule-edit-${++uid}`;
      const text = el('textarea', { id, rows: 2, maxlength: 500, placeholder: 'z. B. „Keine Farmen direkt am Spawn“…' });
      text.value = rule.text;
      text.addEventListener('input', onChange);
      return {
        el: el('div', { class: 'editor-fields rule-fields' },
          el('label', { for: id, class: 'rule-numeral' }, el('span', { 'aria-hidden': 'true', text: numeral(i) }), el('span', { class: 'visually-hidden', text: `Regel ${numeral(i)}` })),
          text),
        read: () => ({ id: rule.id, text: text.value }),
        focus: () => text.focus(),
      };
    },
    save: (rules) => content.send('PUT', '/rules', { rules }),
  });
}

/** @param {ReturnType<typeof import('../lib/resource.js').createResource>} content */
export function createStaffEditor(content) {
  return createListEditor({
    title: 'Staff',
    addLabel: 'Rolle hinzufügen',
    itemName: (i) => `Rolle ${i + 1}`,
    hint: el('p', { class: 'editor-hint', text: 'Mehrere Namen mit Komma trennen. Die Farbe ist das Band der Rolle auf der Staff-Seite.' }),
    blank: () => ({ id: '', role: '', tincture: 'azure', names: [] }),
    makeRow(entry, i, onChange) {
      const n = ++uid;
      const role = el('input', { id: `staff-role-${n}`, maxlength: 40, autocomplete: 'off', placeholder: 'z. B. „Moderator“…' });
      role.value = entry.role;
      const tincture = el('select', { id: `staff-tincture-${n}` }, ...TINCTURES.map((t) => el('option', { value: t.key, text: t.label, selected: t.key === entry.tincture })));
      const names = el('input', { id: `staff-names-${n}`, class: 'mono', maxlength: 700, autocomplete: 'off', spellcheck: 'false', placeholder: 'Pixel_wars, praeditus…' });
      names.value = entry.names.join(', ');
      const swatch = el('span', { class: 'tab-shield', 'aria-hidden': 'true', dataset: { tincture: entry.tincture } });
      tincture.addEventListener('change', () => { swatch.dataset.tincture = tincture.value; });
      for (const f of [role, tincture, names]) f.addEventListener('input', onChange);
      return {
        el: el('div', { class: 'editor-fields staff-fields' },
          el('div', { class: 'field' }, el('label', { for: role.id, text: 'Rolle' }), role),
          el('div', { class: 'field' }, el('label', { for: tincture.id }, swatch, ' Farbe'), tincture),
          el('div', { class: 'field field-wide' }, el('label', { for: names.id, text: 'Namen' }), names)),
        read: () => ({
          id: entry.id,
          role: role.value,
          tincture: tincture.value,
          names: names.value.split(',').map((s) => s.trim()).filter(Boolean),
        }),
        focus: () => role.focus(),
      };
    },
    save: (staff) => content.send('PUT', '/staff', { staff }),
  });
}
