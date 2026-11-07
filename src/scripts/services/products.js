import { simulateLatency } from '../lib/latency.js';

const TIMEOUT_MS = 8000;

/**
 * Loads product case studies from a JSON endpoint: today the static
 * public/data/products.json, later a CMS/API returning the same shape.
 * Throws on network errors, timeouts, non-2xx responses or a malformed body.
 */
export async function fetchProducts(url) {
  const [response] = await Promise.all([
    fetch(url, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    }),
    simulateLatency(),
  ]);
  if (!response.ok) throw new Error(`Products request failed: HTTP ${response.status}`);

  const data = await response.json();
  if (!Array.isArray(data.products)) throw new Error('Products response has no "products" array');
  return data.products;
}
