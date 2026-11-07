const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

/** Live check: respects the user changing the OS setting mid-session. */
export const prefersReducedMotion = () => reducedMotion.matches;

/** `behavior` value for scrollTo/scrollBy that honors reduced motion. */
export const scrollBehavior = () => (prefersReducedMotion() ? 'auto' : 'smooth');
