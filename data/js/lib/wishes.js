// Pure helpers for the plugin/datapack wish list.

/** @typedef {{ id: string, kind: 'plugin'|'datapack', name: string, link: string, reason: string, by: string,
 *   status: string, note: string, votes: number, voted: boolean, created: number }} Wish */

/** Still-open work first (open, review, accepted), then finished, then rejected. */
const STATUS_RANK = { open: 0, review: 0, accepted: 0, done: 1, rejected: 2 };

/** @param {readonly Wish[]} list @returns {Wish[]} */
export function sortRequests(list) {
  return [...list].sort((a, b) =>
    (STATUS_RANK[a.status] ?? 0) - (STATUS_RANK[b.status] ?? 0)
    || b.votes - a.votes
    || b.created - a.created);
}

/** @param {readonly Wish[]} list @returns {{ all: number, plugin: number, datapack: number }} */
export function countKinds(list) {
  return {
    all: list.length,
    plugin: list.filter((r) => r.kind === 'plugin').length,
    datapack: list.filter((r) => r.kind === 'datapack').length,
  };
}
