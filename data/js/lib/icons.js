// Authored icon set: 20px grid, 1.6 stroke, round joins. Returned as fresh SVG nodes.
const NS = 'http://www.w3.org/2000/svg';

const PATHS = {
  shield: 'M4 3h12v7.2c0 3.6-2.6 5.9-6 7.3-3.4-1.4-6-3.7-6-7.3Z',
  charge: 'm6.8 9.6 2.2 2.2 4.4-4.6',
  copy: 'M7 7h9v10H7zM4 13V3h9',
  check: 'm4.5 10.5 3.5 3.5 7.5-8',
  trash: 'M4 6h12M8 6V4h4v2M6 6l.8 10.5h6.4L14 6',
  image: 'M3 4h14v12H3zM3 13l4-4 4 4 2-2 4 4M13 7.5h.01',
  search: 'M9 15a6 6 0 1 0 0-12 6 6 0 0 0 0 12ZM13.5 13.5 17 17',
  close: 'm5 5 10 10M15 5 5 15',
  external: 'M11 3h6v6M17 3l-8 8M14 12v5H3V6h5',
  sun: 'M10 13.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7ZM10 1.5v2M10 16.5v2M1.5 10h2M16.5 10h2M4 4l1.4 1.4M14.6 14.6 16 16M4 16l1.4-1.4M14.6 5.4 16 4',
  moon: 'M16 12.5A7 7 0 0 1 7.5 4a7 7 0 1 0 8.5 8.5Z',
  undo: 'M6 8H13a4 4 0 0 1 0 8H8M6 8l3-3M6 8l3 3',
  pin: 'M10 18s6-5.2 6-10a6 6 0 1 0-12 0c0 4.8 6 10 6 10ZM10 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z',
  refresh: 'M16 10a6 6 0 1 1-1.8-4.3M16 3v4h-4',
  chevronUp: 'm5 12.5 5-5 5 5',
  arrowUp: 'M10 16V4M5 9l5-5 5 5',
  arrowDown: 'M10 4v12M5 11l5 5 5-5',
  plus: 'M10 4v12M4 10h12',
  edit: 'M12.5 4.5l3 3L7 16H4v-3ZM11 6l3 3',
  key: 'M12.5 11.5a4 4 0 1 0-3.9-3.1L3 14v3h3v-2h2v-2h1.6l1-1a4 4 0 0 0 1.9-.4ZM13.5 6.5h.01',
  logout: 'M8 4H4v12h4M13 6l4 4-4 4M17 10H8',
  eye: 'M1.5 10S4.5 4 10 4s8.5 6 8.5 6-3 6-8.5 6S1.5 10 1.5 10ZM10 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z',
  eyeOff: 'M3 3l14 14M8.2 4.3A8 8 0 0 1 10 4c5.5 0 8.5 6 8.5 6a14 14 0 0 1-2.6 3.3M5.3 5.9C2.9 7.6 1.5 10 1.5 10s3 6 8.5 6a8 8 0 0 0 3.6-.8M8.3 8.4a2.5 2.5 0 0 0 3.3 3.3',
  star: 'M10 2.5l2.2 4.6 5 .7-3.6 3.5.9 5-4.5-2.4-4.5 2.4.9-5L2.8 7.8l5-.7Z',
  scroll: 'M5 3h10v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-1h3ZM5 3a2 2 0 0 0-2 2v1h2M8 7h5M8 10h5',
};

/**
 * @param {keyof typeof PATHS} name
 * @param {{ size?: number, class?: string }} [opts]
 * @returns {SVGSVGElement}
 */
export function icon(name, { size = 20, class: cls = '' } = {}) {
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('viewBox', '0 0 20 20');
  svg.setAttribute('width', String(size));
  svg.setAttribute('height', String(size));
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');
  svg.setAttribute('class', `icon icon-${name} ${cls}`.trim());
  const path = document.createElementNS(NS, 'path');
  path.setAttribute('d', PATHS[name]);
  svg.append(path);
  return svg;
}
