import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { comparablePath } from './paths.js';

const INCLUDE = /<!--\s*@include\s+([\w./-]+)\s*-->/g;
const PAGE_ID = /<body\b[^>]*\bdata-page="([\w-]+)"/;
const MAX_DEPTH = 8;

/**
 * Build-time HTML partials for the multi-page app.
 *
 * 1. `<!-- @include header.html -->` is replaced by that file from `dir`
 *    (nested includes allowed). It runs as a `pre` transform, so Vite still
 *    processes the asset URLs, stylesheets and scripts inside partials.
 * 2. The page id from `<body data-page="about">` adds aria-current="page" to
 *    every `data-nav-id="about"` element, so the active nav state ships in
 *    the HTML with no runtime JS.
 */
export function htmlPartials({ dir }) {
  const partialsDir = comparablePath(dir);

  const inline = (html, chain) =>
    html.replace(INCLUDE, (_, name) => {
      if (chain.length > MAX_DEPTH) {
        throw new Error(`[html-partials] Include depth exceeded: ${[...chain, name].join(' → ')}`);
      }
      let source;
      try {
        source = readFileSync(resolve(dir, name), 'utf8');
      } catch {
        throw new Error(
          `[html-partials] Partial "${name}" not found in ${dir} (included from ${chain.at(-1)})`
        );
      }
      return inline(source, [...chain, name]);
    });

  return {
    name: 'html-partials',

    transformIndexHtml: {
      order: 'pre',
      handler(html, ctx) {
        const output = inline(html, [ctx.path]);
        const page = output.match(PAGE_ID)?.[1];
        if (!page) return output;
        return output.replaceAll(
          `data-nav-id="${page}"`,
          `data-nav-id="${page}" aria-current="page"`
        );
      },
    },

    configureServer(server) {
      // Partials aren't in the module graph, and Vite's own HTML reload only
      // refreshes the page whose file changed — so reload every open page.
      server.watcher.on('change', (file) => {
        if (comparablePath(file).startsWith(partialsDir)) {
          server.ws.send({ type: 'full-reload' });
        }
      });
    },
  };
}
