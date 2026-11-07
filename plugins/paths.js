import { normalizePath } from 'vite';

/**
 * Normalizes a file path for prefix comparisons between watcher events and
 * configured directories: forward slashes everywhere, and case-insensitive on
 * Windows, where the same drive can surface as `C:` or `c:`.
 */
export function comparablePath(path) {
  const normalized = normalizePath(path);
  return process.platform === 'win32' ? normalized.toLowerCase() : normalized;
}
