// Tiny DOM builder. Text always goes through textContent, so user data never becomes markup.

/**
 * @param {string} tag
 * @param {Record<string, unknown>} [props] attributes; `class`, `text`, `dataset`, `on*` handled specially
 * @param {...(Node|string|null|false|undefined)} children
 * @returns {HTMLElement}
 */
export function el(tag, props = {}, ...children) {
  const node = document.createElement(tag);
  for (const [name, value] of Object.entries(props)) {
    if (value === null || value === undefined || value === false) continue;
    if (name === 'class') node.className = String(value);
    else if (name === 'text') node.textContent = String(value);
    else if (name === 'dataset') Object.assign(node.dataset, value);
    else if (name.startsWith('on') && typeof value === 'function') node.addEventListener(name.slice(2), value);
    else if (value === true) node.setAttribute(name, '');
    else node.setAttribute(name, String(value));
  }
  node.append(...children.filter((c) => c !== null && c !== false && c !== undefined));
  return node;
}

/** @param {string} selector @param {ParentNode} [root] @returns {HTMLElement} */
export function $(selector, root = document) {
  const node = root.querySelector(selector);
  if (!node) throw new Error(`missing element ${selector}`);
  return /** @type {HTMLElement} */ (node);
}

/** @param {string} selector @param {ParentNode} [root] @returns {HTMLElement[]} */
export const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

/** @returns {boolean} */
export const prefersReducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
