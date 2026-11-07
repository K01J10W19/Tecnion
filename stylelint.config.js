/*
 * Design-token contract from CLAUDE.md, enforced mechanically:
 * - Spacing (margin / padding / gap / scroll offsets) must come from the 8px
 *   grid tokens (--space-*), never raw px/rem/em lengths.
 * - Colors must come from tokens: no hex, named colors or rgb()/hsl().
 *   Derive tints with color-mix() from a token instead.
 * src/styles/tokens.css is the only file allowed to hold raw values.
 */
const RAW_LENGTH = '/\\b\\d*\\.?\\d+(px|rem|em)\\b/';

/** @type {import('stylelint').Config} */
export default {
  rules: {
    'declaration-property-value-disallowed-list': {
      '/^(margin|padding|gap|row-gap|column-gap|scroll-margin|scroll-padding)/': [RAW_LENGTH],
    },
    'color-no-hex': true,
    'color-named': 'never',
    'function-disallowed-list': ['rgb', 'rgba', 'hsl', 'hsla'],
    'declaration-no-important': true,
    'selector-max-id': 0,
  },
  overrides: [
    {
      files: ['src/styles/tokens.css'],
      rules: {
        'declaration-property-value-disallowed-list': null,
        'color-no-hex': null,
        'function-disallowed-list': null,
      },
    },
  ],
};
