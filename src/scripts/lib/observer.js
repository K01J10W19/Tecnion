/**
 * Shared IntersectionObserver helpers: the only module allowed to create
 * observers (enforced by eslint.config.js). Scroll-driven behavior in this
 * codebase goes through here; there are no scroll event listeners.
 *
 * Observers are pooled per (rootMargin, threshold) for the viewport root, so a
 * page with dozens of reveal targets shares a single observer. Observers with
 * a custom `root` element (e.g. a carousel track) get their own instance.
 */
const pools = new Map();

function createPool(options) {
  const listeners = new Map();
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      for (const listener of listeners.get(entry.target) ?? []) listener(entry);
    }
  }, options);

  return {
    add(element, listener) {
      if (!listeners.has(element)) {
        listeners.set(element, new Set());
        observer.observe(element);
      }
      listeners.get(element).add(listener);
    },
    remove(element, listener) {
      const set = listeners.get(element);
      if (!set) return;
      set.delete(listener);
      if (set.size === 0) {
        listeners.delete(element);
        observer.unobserve(element);
      }
    },
  };
}

function getPool(options) {
  if (options.root) return createPool(options);
  const key = JSON.stringify([options.rootMargin ?? '0px', options.threshold ?? 0]);
  if (!pools.has(key)) pools.set(key, createPool(options));
  return pools.get(key);
}

/**
 * Calls onEnter(element, entry) the first time each element intersects, then
 * stops watching it (one-shot entrances).
 */
export function observeOnce(elements, onEnter, options = {}) {
  const pool = getPool(options);
  for (const element of elements) {
    const listener = (entry) => {
      if (!entry.isIntersecting) return;
      pool.remove(element, listener);
      onEnter(element, entry);
    };
    pool.add(element, listener);
  }
}

/**
 * Reports every intersection change of one element:
 * onChange(isIntersecting, entry). Returns a function that stops observing.
 */
export function observeVisibility(element, onChange, options = {}) {
  const pool = getPool(options);
  const listener = (entry) => onChange(entry.isIntersecting, entry);
  pool.add(element, listener);
  return () => pool.remove(element, listener);
}
