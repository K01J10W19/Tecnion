import { observeReveal } from '../core/reveal.js';
import { h } from '../lib/dom.js';
import { fetchProducts } from '../services/products.js';
import { icon } from '../ui/icon.js';
import { productCase } from '../ui/product-case.js';
import { statusMessage } from '../ui/status.js';

/**
 * Data-driven product list:
 *   <div data-component="product-list" data-src="/data/products.json"
 *        data-status="#products-status" aria-busy="true"> skeletons… </div>
 * The skeleton cards are pre-rendered in the HTML, so they show before any JS
 * runs and nothing shifts. On a failed fetch, an error with a Retry button
 * replaces them, and Retry restores the same skeletons. Progress goes to the
 * small live region named by data-status, never to the big list itself.
 */
export function mount(root) {
  const skeletons = [...root.children].map((node) => node.cloneNode(true));
  const announcer = root.dataset.status ? document.querySelector(root.dataset.status) : null;
  const announce = (text) => {
    if (announcer) announcer.textContent = text;
  };

  const load = async () => {
    root.setAttribute('aria-busy', 'true');
    root.replaceChildren(...skeletons.map((node) => node.cloneNode(true)));
    announce('Loading products…');

    try {
      const products = await fetchProducts(root.dataset.src);
      root.replaceChildren(...products.map(productCase));
      observeReveal(root);
      announce(`${products.length} products loaded.`);
    } catch (error) {
      console.error(error);
      root.replaceChildren(
        statusMessage({
          tone: 'error',
          title: 'Couldn’t load products',
          message: 'Please check your connection and try again.',
          action: h(
            'button',
            { class: 'btn btn--outline', type: 'button', onClick: load },
            icon('refresh-cw', { className: 'btn__icon' }),
            'Try again'
          ),
        })
      );
      announce('Couldn’t load products.');
    } finally {
      root.setAttribute('aria-busy', 'false');
    }
  };

  load();
}
