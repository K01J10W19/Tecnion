// Set VITE_SIMULATED_LATENCY (ms) in .env.development to make loading states
// visible locally. Unset (0) in production builds.
const simulatedLatency = Number(import.meta.env.VITE_SIMULATED_LATENCY) || 0;

export const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/** Resolves after the configured artificial latency (immediately when 0). */
export const simulateLatency = () => (simulatedLatency > 0 ? wait(simulatedLatency) : undefined);
