import { qs } from '../lib/dom.js';
import { observeVisibility } from '../lib/observer.js';

/**
 * Sets [data-scrolled] on the sticky header once a sentinel at the very top
 * of the page leaves the viewport. CSS gives the scrolled bar its shadow.
 */
export function initSiteHeader() {
  const header = qs('[data-site-header]');
  const sentinel = qs('[data-header-sentinel]');
  if (!header || !sentinel) return;

  observeVisibility(sentinel, (isVisible) => {
    header.dataset.scrolled = String(!isVisible);
  });
}
