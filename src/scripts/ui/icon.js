import { svg } from '../lib/dom.js';

/**
 * Sprite icon element. `name` must be listed in vite.config.js (icons) or
 * live in src/assets/icons/. Decorative by default; pass `label` for an icon
 * that carries meaning on its own.
 */
export function icon(name, { className = '', label } = {}) {
  return svg(
    'svg',
    {
      class: ['icon', className].filter(Boolean).join(' '),
      'aria-hidden': label ? null : 'true',
      role: label ? 'img' : null,
      'aria-label': label ?? null,
      focusable: 'false',
    },
    svg('use', { href: `#icon-${name}` })
  );
}
