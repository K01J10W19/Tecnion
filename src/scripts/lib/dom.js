const SVG_NS = 'http://www.w3.org/2000/svg';

export const qs = (selector, root = document) => root.querySelector(selector);
export const qsa = (selector, root = document) => [...root.querySelectorAll(selector)];

function applyProps(element, props) {
  for (const [key, value] of Object.entries(props)) {
    if (value === false || value === null || value === undefined) continue;
    if (key === 'class') {
      element.setAttribute('class', value);
    } else if (key === 'dataset') {
      Object.assign(element.dataset, value);
    } else if (key.startsWith('on') && typeof value === 'function') {
      element.addEventListener(key.slice(2).toLowerCase(), value);
    } else {
      element.setAttribute(key, value === true ? '' : String(value));
    }
  }
}

const toNodes = (children) =>
  children
    .flat(Infinity)
    .filter((child) => child !== null && child !== undefined && child !== false)
    .map((child) => (child instanceof Node ? child : String(child)));

/**
 * Hyperscript-style element factory: h('p', { class: 'lead' }, 'Text', h('strong', {}, '!')).
 * String children become text nodes and are never parsed as HTML, so data
 * can't inject markup.
 *
 * Props: `class`; `dataset` (object); `on<Event>` (listener); anything else is
 * an attribute (true = empty attribute; false/null/undefined = omitted).
 */
export function h(tag, props = {}, ...children) {
  const element = document.createElement(tag);
  applyProps(element, props);
  element.append(...toNodes(children));
  return element;
}

/** h() for SVG elements (sprite icons: <svg><use href="#icon-…"></use></svg>). */
export function svg(tag, props = {}, ...children) {
  const element = document.createElementNS(SVG_NS, tag);
  applyProps(element, props);
  element.append(...toNodes(children));
  return element;
}
