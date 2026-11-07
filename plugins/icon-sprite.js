import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { basename, join, resolve } from 'node:path';
import { comparablePath } from './paths.js';

const SVG_ROOT = /<svg\b([^>]*)>([\s\S]*?)<\/svg>/;
const ATTRIBUTE = /([\w:-]+)="([^"]*)"/g;
const COMMENT = /<!--[\s\S]*?-->/g;

// Root <svg> attributes a custom icon may rely on; they move onto its <symbol>.
const KEPT_ATTRIBUTES = new Set([
  'viewBox',
  'fill',
  'stroke',
  'stroke-width',
  'stroke-linecap',
  'stroke-linejoin',
  'fill-rule',
  'clip-rule',
]);

function toSymbol(id, svg, { keepPresentation }) {
  const match = svg.replace(COMMENT, '').match(SVG_ROOT);
  if (!match) throw new Error(`[icon-sprite] "${id}" is not a valid SVG file`);
  const [, rawAttributes, inner] = match;
  const attributes = [...rawAttributes.matchAll(ATTRIBUTE)]
    .filter(([, name]) => name === 'viewBox' || (keepPresentation && KEPT_ATTRIBUTES.has(name)))
    .map(([, name, value]) => `${name}="${value}"`)
    .join(' ');
  // Collapse whitespace (attributes may span lines), then drop it between tags.
  const body = inner.replace(/\s+/g, ' ').replace(/>\s+</g, '><').trim();
  return `<symbol id="icon-${id}" ${attributes}>${body}</symbol>`;
}

/**
 * Inline SVG sprite. Every page gets one hidden <svg> of
 * <symbol id="icon-NAME"> elements, injected at the top of <body>. Markup and
 * JS reference icons with <svg class="icon"><use href="#icon-NAME"></use></svg>.
 *
 * - `lucide`: icon names from lucide-static. Only the shapes are kept; stroke
 *   and color come from the .icon class, so icons follow `currentColor`.
 * - `customDir`: project SVGs (logo mark, flag) keep their own fills.
 *
 * Unknown icon names fail loudly instead of rendering an empty icon. Icons
 * that only JS render functions use must be listed too.
 */
export function iconSprite({ lucide = [], customDir }) {
  let lucideDir;

  const buildSprite = () => {
    const symbols = lucide.map((name) => {
      const file = join(lucideDir, `${name}.svg`);
      if (!existsSync(file)) {
        throw new Error(`[icon-sprite] Unknown Lucide icon "${name}" (no ${file})`);
      }
      return toSymbol(name, readFileSync(file, 'utf8'), { keepPresentation: false });
    });
    if (customDir) {
      for (const file of readdirSync(customDir).filter((f) => f.endsWith('.svg'))) {
        const svg = readFileSync(join(customDir, file), 'utf8');
        symbols.push(toSymbol(basename(file, '.svg'), svg, { keepPresentation: true }));
      }
    }
    return symbols.join('');
  };

  return {
    name: 'icon-sprite',

    configResolved(config) {
      lucideDir = resolve(config.root, 'node_modules/lucide-static/icons');
    },

    // Rebuilt per page (a few dozen tiny reads) so icon edits show up in dev.
    transformIndexHtml() {
      return [
        {
          tag: 'svg',
          attrs: {
            class: 'icon-sprite',
            xmlns: 'http://www.w3.org/2000/svg',
            width: '0',
            height: '0',
            'aria-hidden': 'true',
            focusable: 'false',
          },
          children: buildSprite(),
          injectTo: 'body-prepend',
        },
      ];
    },

    configureServer(server) {
      if (!customDir) return;
      const watched = comparablePath(customDir);
      server.watcher.on('change', (file) => {
        if (comparablePath(file).startsWith(watched)) {
          server.ws.send({ type: 'full-reload' });
        }
      });
    },
  };
}
