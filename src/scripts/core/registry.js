/**
 * Lazy component islands. Each file in ../components/ is a component whose
 * file name matches its `data-component` value, so
 * components/carousel.js mounts on <div data-component="carousel">.
 * A page downloads a component's code only if its markup uses it.
 *
 * Component contract: `export function mount(element) {}`.
 */
const loaders = Object.fromEntries(
  Object.entries(import.meta.glob('../components/*.js')).map(([path, load]) => [
    path.match(/([\w-]+)\.js$/)[1],
    load,
  ])
);

/** Mounts every not-yet-mounted [data-component] inside root (re-run for injected DOM). */
export async function mountComponents(root = document) {
  const elements = [...root.querySelectorAll('[data-component]:not([data-mounted])')];

  await Promise.all(
    elements.map(async (element) => {
      const name = element.dataset.component;
      element.dataset.mounted = 'true';
      const load = loaders[name];
      if (!load) {
        console.warn(`[registry] No component "${name}" in src/scripts/components/`);
        return;
      }
      try {
        const { mount } = await load();
        mount(element);
      } catch (error) {
        console.error(`[registry] Failed to mount "${name}"`, error);
      }
    })
  );
}
