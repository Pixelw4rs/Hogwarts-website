'use strict';
// One JSON file on disk: loaded once, written atomically (tmp + rename), backed up if corrupt.
const fs = require('fs');

/**
 * @template T
 * @param {string} file
 * @param {() => T} defaults fresh starting state
 * @param {(raw: any) => T} normalize repairs a loaded state (missing keys, wrong types)
 */
function createJsonStore(file, defaults, normalize) {
  let state = defaults();
  if (fs.existsSync(file)) {
    try {
      state = normalize(JSON.parse(fs.readFileSync(file, 'utf8')));
    } catch (e) {
      const bak = `${file}.corrupt-${Date.now()}`;
      fs.copyFileSync(file, bak);
      console.error(`${file} unreadable, backed up to`, bak);
      state = defaults();
    }
  }
  return {
    get state() { return state; },
    /** Bumps rev and saves. */
    persist() {
      state.rev = (Number(state.rev) || 0) + 1;
      const tmp = `${file}.tmp`;
      fs.writeFileSync(tmp, JSON.stringify(state));
      fs.renameSync(tmp, file);
    },
  };
}

module.exports = { createJsonStore };
