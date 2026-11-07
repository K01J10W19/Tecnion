import js from '@eslint/js';
import globals from 'globals';

/*
 * Architecture rules from CLAUDE.md, enforced mechanically:
 * - DOM is built with h() (src/scripts/lib/dom.js), never from raw HTML
 *   strings — data can't turn into markup, so there's no XSS surface.
 * - IntersectionObserver is only instantiated inside lib/observer.js, which
 *   pools observers; everything else uses its helpers (no scroll listeners).
 */
const noRawHtml = [
  {
    selector: 'AssignmentExpression[left.property.name=/^(innerHTML|outerHTML)$/]',
    message: 'Build DOM with h() from lib/dom.js instead of assigning raw HTML.',
  },
  {
    selector: "CallExpression[callee.property.name='insertAdjacentHTML']",
    message: 'Build DOM with h() from lib/dom.js instead of injecting raw HTML.',
  },
];

const noDirectObserver = {
  selector: "NewExpression[callee.name='IntersectionObserver']",
  message: 'Use the shared helpers in lib/observer.js instead of a new IntersectionObserver.',
};

export default [
  { ignores: ['dist/', 'node_modules/'] },
  js.configs.recommended,
  {
    files: ['src/**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: { ...globals.browser },
    },
    rules: {
      'no-var': 'error',
      'prefer-const': 'error',
      eqeqeq: ['error', 'always'],
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'no-restricted-syntax': ['error', ...noRawHtml, noDirectObserver],
    },
  },
  {
    files: ['src/scripts/lib/observer.js'],
    rules: { 'no-restricted-syntax': ['error', ...noRawHtml] },
  },
  {
    files: ['*.config.js', 'plugins/**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: { ...globals.node },
    },
  },
];
