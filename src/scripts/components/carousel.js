import { scrollBehavior } from '../lib/motion.js';
import { observeVisibility } from '../lib/observer.js';

// A slide counts as "in view" once 90% of it is visible inside the track.
const IN_VIEW_RATIO = 0.9;

/**
 * Enhances a CSS scroll-snap carousel:
 *   <div data-component="carousel" role="region" aria-roledescription="carousel" aria-label="…">
 *     <button data-carousel-prev>…</button>
 *     <div data-carousel-track tabindex="0"> slides… </div>
 *     <button data-carousel-next>…</button>
 *   </div>
 * Arrows scroll by one slide. Edge state comes from observing the first and
 * last slides inside the track (no scroll listeners). Arrows at an edge get
 * aria-disabled (they stay focusable), and both hide when everything fits.
 */
export function mount(root) {
  const track = root.querySelector('[data-carousel-track]');
  if (!track || track.children.length === 0) return;

  const prev = root.querySelector('[data-carousel-prev]');
  const next = root.querySelector('[data-carousel-next]');
  const slides = [...track.children];

  slides.forEach((slide, index) => {
    slide.setAttribute('role', 'group');
    slide.setAttribute('aria-roledescription', 'slide');
    slide.setAttribute('aria-label', `${index + 1} of ${slides.length}`);
  });

  const atEdge = { start: true, end: slides.length === 1 };
  const sync = () => {
    prev?.setAttribute('aria-disabled', String(atEdge.start));
    next?.setAttribute('aria-disabled', String(atEdge.end));
    root.dataset.static = String(atEdge.start && atEdge.end);
  };
  sync();

  const options = { root: track, threshold: [0, IN_VIEW_RATIO, 1] };
  observeVisibility(
    slides[0],
    (_, entry) => {
      atEdge.start = entry.intersectionRatio >= IN_VIEW_RATIO;
      sync();
    },
    options
  );
  observeVisibility(
    slides.at(-1),
    (_, entry) => {
      atEdge.end = entry.intersectionRatio >= IN_VIEW_RATIO;
      sync();
    },
    options
  );

  const step = (direction) => {
    const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
    const distance = slides[0].getBoundingClientRect().width + gap;
    track.scrollBy({ left: direction * distance, behavior: scrollBehavior() });
  };

  prev?.addEventListener('click', () => {
    if (!atEdge.start) step(-1);
  });
  next?.addEventListener('click', () => {
    if (!atEdge.end) step(1);
  });
}
