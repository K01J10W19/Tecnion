import { h } from '../lib/dom.js';

/** Outlined technology tags: ["NVIDIA", "Ethernet"] → <ul class="tag-list">. */
export const tagList = (tags, { className = '' } = {}) =>
  h(
    'ul',
    { class: ['tag-list', className].filter(Boolean).join(' '), role: 'list' },
    tags.map((tag) => h('li', { class: 'tag' }, tag))
  );

/** Tinted topic hashtags shown at the foot of a product case. */
export const hashtagList = (hashtags) =>
  h(
    'ul',
    { class: 'hashtag-list', role: 'list' },
    hashtags.map((hashtag) => h('li', { class: 'hashtag' }, hashtag))
  );
