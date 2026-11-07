import { initSiteHeader } from './shell/site-header.js';
import { initSiteNav } from './shell/site-nav.js';
import { initOrderDialog } from './shell/order-dialog.js';
import { initOrderForm } from './shell/order-form.js';
import { initReveal } from './core/reveal.js';
import { mountComponents } from './core/registry.js';

/*
 * The single entry module for every page (loaded by src/partials/head.html).
 * Module scripts are deferred, so the DOM is parsed by the time this runs.
 * - The site shell (header, nav, order dialog) initializes eagerly.
 * - Page content islands ([data-component]) are lazy-loaded by the registry,
 *   so each page downloads only the code it actually uses.
 */
initSiteHeader();
initSiteNav();
initOrderDialog();
initOrderForm();
initReveal();
mountComponents();
