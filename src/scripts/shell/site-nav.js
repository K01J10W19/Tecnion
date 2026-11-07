import { qs } from '../lib/dom.js';

const LAPTOP = '(min-width: 1024px)';

/**
 * Mobile/tablet menu panel. State lives in [data-nav-open] on the header (CSS
 * shows the panel) and aria-expanded on the toggle. While it's open the page
 * behind is inert and scroll-locked. Escape closes it and returns focus to
 * the toggle. Choosing a link closes it, and so does growing to laptop width,
 * where the inline nav takes over.
 */
export function initSiteNav() {
  const header = qs('[data-site-header]');
  const toggle = qs('[data-nav-toggle]');
  const nav = qs('[data-site-nav]');
  if (!header || !toggle || !nav) return;

  const background = [qs('main'), qs('.site-footer')].filter(Boolean);
  const isOpen = () => header.dataset.navOpen === 'true';

  const setOpen = (open, { restoreFocus = false } = {}) => {
    header.dataset.navOpen = String(open);
    toggle.setAttribute('aria-expanded', String(open));
    document.documentElement.dataset.scrollLock = String(open);
    background.forEach((element) => {
      element.inert = open;
    });
    if (open) qs('a, button', nav)?.focus({ preventScroll: true });
    else if (restoreFocus) toggle.focus();
  };

  toggle.addEventListener('click', () => setOpen(!isOpen()));

  nav.addEventListener('click', (event) => {
    if (isOpen() && event.target.closest('a')) setOpen(false);
  });

  document.addEventListener('keydown', (event) => {
    // An open dialog handles its own Escape; leave the menu as it is.
    if (event.key !== 'Escape' || !isOpen() || qs('dialog[open]')) return;
    setOpen(false, { restoreFocus: true });
  });

  window.matchMedia(LAPTOP).addEventListener('change', (event) => {
    if (event.matches && isOpen()) setOpen(false);
  });
}
