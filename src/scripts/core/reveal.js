import { observeOnce } from '../lib/observer.js';

/*
 * Scroll-triggered enter animations. This module only toggles the
 * .is-revealed class; motion lives in src/styles/utilities/motion.css.
 * threshold 0 with a bottom inset fires once an element's top edge is 64px
 * inside the viewport, so the motion is visible:
 * - works for elements of any height (a ratio threshold can never be reached
 *   by elements much taller than the viewport);
 * - the inset is fixed, not a percentage, so even on very tall viewports the
 *   last elements still trigger (the footer always sits below them).
 */
const OPTIONS = { threshold: 0, rootMargin: '0px 0px -64px 0px' };

/**
 * Registers every unrevealed .reveal inside root. Call it again for injected
 * content. Children of [data-reveal-stagger] get --reveal-order 0,1,2,… so
 * they enter one after another.
 */
export function observeReveal(root = document) {
  for (const group of root.querySelectorAll('[data-reveal-stagger]')) {
    [...group.children]
      .filter((child) => child.classList.contains('reveal'))
      .forEach((child, index) => child.style.setProperty('--reveal-order', String(index)));
  }

  observeOnce(
    root.querySelectorAll('.reveal:not(.is-revealed)'),
    (element) => element.classList.add('is-revealed'),
    OPTIONS
  );
}

export const initReveal = () => observeReveal(document);
