import { h } from '../lib/dom.js';
import { checkList } from './check-list.js';
import { icon } from './icon.js';
import { hashtagList, tagList } from './tag-list.js';

/** Muted card with an icon heading; content is a paragraph or a checklist. */
const briefCard = (iconName, title, content) =>
  h(
    'div',
    { class: 'card card--muted' },
    h(
      'div',
      { class: 'card__header' },
      icon(iconName, { className: 'icon--lg product-case__brief-icon' }),
      h('h3', { class: 'title-card' }, title)
    ),
    Array.isArray(content) ? checkList(content) : h('p', { class: 'card__text' }, content)
  );

const listCard = (title, items) =>
  h(
    'div',
    { class: 'card card--muted' },
    h('h3', { class: 'title-card' }, title),
    checkList(items)
  );

/**
 * One product case study (Products page) built from a products.json entry.
 * See public/data/products.json for the data shape.
 */
export function productCase(product, index = 0) {
  const titleId = `product-${product.id}-title`;

  return h(
    'article',
    { class: 'product-case reveal', 'aria-labelledby': titleId },
    h(
      'header',
      { class: 'product-case__header' },
      h(
        'hgroup',
        { class: 'product-case__heading' },
        h('p', { class: 'product-case__label' }, product.label),
        h('h2', { class: 'product-case__title', id: titleId }, product.title),
        h('p', { class: 'product-case__summary' }, product.summary)
      ),
      h(
        'div',
        { class: 'product-case__aside' },
        h(
          'figure',
          { class: 'media media--contain product-case__media' },
          h('img', {
            src: product.image.src,
            alt: product.image.alt,
            width: product.image.width,
            height: product.image.height,
            loading: index === 0 ? 'eager' : 'lazy',
            decoding: 'async',
          })
        ),
        tagList(product.tags)
      )
    ),
    h(
      'div',
      { class: 'product-case__pair' },
      briefCard('crosshair', 'Task', product.task),
      briefCard('circle-alert', 'Initial problem', product.problem)
    ),
    h(
      'section',
      { class: 'product-case__section', 'aria-labelledby': `${titleId}-done` },
      h('h3', { class: 'product-case__section-title', id: `${titleId}-done` }, 'What we did'),
      checkList(product.done, { columns: 2 })
    ),
    h(
      'div',
      { class: 'product-case__pair' },
      listCard('Result', product.results),
      listCard('Package contents', product.kit)
    ),
    hashtagList(product.hashtags)
  );
}
