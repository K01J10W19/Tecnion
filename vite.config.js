import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import { htmlPartials } from './plugins/html-partials.js';
import { iconSprite } from './plugins/icon-sprite.js';

const fromRoot = (path) => resolve(import.meta.dirname, path);

/*
 * Every page is a folder holding an index.html, so the folder path is the URL
 * (/about/ → about/index.html) and clean URLs work on any static host.
 * Register new pages here (CLAUDE.md → "Add a page").
 */
const pages = {
  home: 'index.html',
  about: 'about/index.html',
  'pcb-assembly': 'pcb-assembly/index.html',
  products: 'products/index.html',
  delivery: 'delivery/index.html',
  contacts: 'contacts/index.html',
  legal: 'legal/index.html',
  'not-found': '404.html',
};

/*
 * Lucide icons compiled into the inline sprite (<use href="#icon-NAME">).
 * Icons that only JS render functions use (ui/*) must be listed here too.
 */
const icons = [
  // Site chrome
  'menu',
  'x',
  'send',
  'phone',
  'mail',
  'map-pin',
  'external-link',
  'arrow-right',
  'download',
  'chevron-left',
  'chevron-right',
  // Content
  'crosshair',
  'target',
  'circuit-board',
  'microchip',
  'cpu',
  'settings',
  'badge-check',
  'file-cog',
  'award',
  'microscope',
  'eye',
  'puzzle',
  'list-ordered',
  'file-check',
  'pencil-ruler',
  'scan-eye',
  'box',
  'rocket',
  'truck',
  'wallet',
  'shield-check',
  'landmark',
  'banknote',
  'receipt',
  // Feedback & forms
  'circle-alert',
  'circle-check',
  'square-check',
  'paperclip',
  'refresh-cw',
];

export default defineConfig({
  // MPA: dev/preview servers serve each folder's index.html, no SPA fallback.
  appType: 'mpa',
  input: Object.fromEntries(Object.entries(pages).map(([name, file]) => [name, fromRoot(file)])),
  plugins: [
    htmlPartials({ dir: fromRoot('src/partials') }),
    iconSprite({ lucide: icons, customDir: fromRoot('src/assets/icons') }),
  ],
  build: {
    // Emit every image as a hashed, cacheable file. Small SVGs would otherwise
    // be inlined as data URIs and repeated in each page's HTML (several images
    // appear on multiple pages and slides). Icons are already in the sprite.
    assetsInlineLimit: 0,
  },
});
