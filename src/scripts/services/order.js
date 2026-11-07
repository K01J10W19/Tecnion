import { simulateLatency, wait } from '../lib/latency.js';

const endpoint = import.meta.env.VITE_ORDER_ENDPOINT;
const TIMEOUT_MS = 15000;
const DEMO_DELAY_MS = 1200;

/**
 * Sends the order form as multipart/form-data, attachments included, to
 * VITE_ORDER_ENDPOINT. With no endpoint configured, it runs in demo mode: a
 * short delay (so the loading state is visible) and a successful result, with
 * no network request.
 */
export async function submitOrder(formData) {
  if (!endpoint) {
    await wait(DEMO_DELAY_MS);
    return { ok: true, demo: true };
  }

  const [response] = await Promise.all([
    fetch(endpoint, {
      method: 'POST',
      body: formData,
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    }),
    simulateLatency(),
  ]);
  if (!response.ok) throw new Error(`Order request failed: HTTP ${response.status}`);
  return { ok: true, demo: false };
}
