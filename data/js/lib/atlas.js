// Star-atlas projection for the coordinate board: places become stars on an X/Z chart around spawn.
// Pure math, no DOM. North (−Z) is up, east (+X) is right, like the in-game F3 compass.
import { parseCoordinates } from './format.js';

/** Nether blocks map to 8 overworld blocks, so portals line up with what they lead to. */
export const NETHER_SCALE = 8;
const MIN_EXTENT = 100;

/** @typedef {'overworld'|'nether'|'end'} Dimension */
/**
 * @typedef {{ id: string, title: string, x: number, y: number, z: number, dim: Dimension,
 *   wx: number, wz: number, px: number, py: number, mag: number, text: string, dimension: string }} Star
 */

/** @param {string} text free-form dimension label @returns {Dimension} */
export function classifyDimension(text) {
  const t = String(text || '').toLowerCase();
  if (/nether|hölle/.test(t)) return 'nether';
  if (/\bend\b|the_end|ende/.test(t)) return 'end';
  return 'overworld';
}

/** @param {number} value @returns {number} the next 1/2/5 × 10ⁿ step at or above value (min 100) */
export function niceStep(value) {
  if (!(value > 0)) return MIN_EXTENT;
  const pow = 10 ** Math.floor(Math.log10(value));
  const step = [1, 2, 5, 10].map((m) => m * pow).find((s) => s >= value);
  return Math.max(MIN_EXTENT, step);
}

/** Stable 0..1 from an id, so a star keeps its size across reloads. */
function hash01(id) {
  let h = 2166136261;
  for (const ch of String(id)) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  return ((h >>> 0) % 1000) / 1000;
}

/**
 * @param {ReadonlyArray<{ id: string, title: string, meta: string }>} items
 * @param {{ size: number, margin: number }} frame square chart in px
 * @returns {{ points: Star[], unplotted: Array<{ id: string, title: string, reason: string }>, extent: number, rings: number[], step: number }}
 */
export function plotPlaces(items, { size, margin }) {
  const placed = [];
  const unplotted = [];
  for (const item of items) {
    const c = parseCoordinates(item.meta);
    if (!c) { unplotted.push({ id: item.id, title: item.title, reason: 'ohne Koordinaten' }); continue; }
    const dim = classifyDimension(c.dimension);
    if (dim === 'end') { unplotted.push({ id: item.id, title: item.title, reason: 'im End' }); continue; }
    const k = dim === 'nether' ? NETHER_SCALE : 1;
    placed.push({ id: item.id, title: item.title, x: c.x, y: c.y, z: c.z, dim, wx: c.x * k, wz: c.z * k, text: c.text, dimension: c.dimension });
  }
  const far = Math.max(0, ...placed.map((p) => Math.max(Math.abs(p.wx), Math.abs(p.wz))));
  const step = niceStep(far / 3);
  const extent = Math.max(step * Math.ceil(far / step || 1), step);
  const half = size / 2;
  const scale = (half - margin) / extent;
  const points = placed.map((p) => ({
    ...p,
    px: half + p.wx * scale,
    py: half + p.wz * scale,
    mag: 0.6 + hash01(p.id) * 0.8,
  }));
  const rings = [];
  for (let r = step; r <= extent + 1e-9; r += step) rings.push(r * scale);
  return { points, unplotted, extent, rings, step };
}
