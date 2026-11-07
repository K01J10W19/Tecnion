import { h } from '../lib/dom.js';
import { icon } from './icon.js';

const ICONS = { success: 'circle-check', error: 'circle-alert', info: 'circle-alert' };

/**
 * Status block for system feedback (`tone`: success | error | info).
 * It carries no live-region role itself; the container it's placed in owns
 * aria-live, so announcements stay reliable.
 */
export function statusMessage({ tone = 'info', title, message, action }) {
  return h(
    'div',
    { class: `status status--${tone}` },
    icon(ICONS[tone], { className: 'status__icon' }),
    h(
      'div',
      { class: 'status__body' },
      title && h('p', { class: 'status__title' }, title),
      message && h('p', {}, message),
      action
    )
  );
}
