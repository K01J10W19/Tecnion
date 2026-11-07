import { h } from '../lib/dom.js';
import { icon } from './icon.js';

/** Checkbox-style list (square-check icons); `columns: 2` splits it at laptop+. */
export const checkList = (items, { columns = 1 } = {}) =>
  h(
    'ul',
    { class: columns === 2 ? 'check-list check-list--2col' : 'check-list', role: 'list' },
    items.map((item) =>
      h(
        'li',
        { class: 'check-list__item' },
        icon('square-check', { className: 'check-list__icon' }),
        h('span', {}, item)
      )
    )
  );
