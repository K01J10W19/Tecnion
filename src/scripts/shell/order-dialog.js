import { qsa } from '../lib/dom.js';

/**
 * Native <dialog> wiring through event delegation, so triggers added later
 * work too:
 *   [data-dialog-open="<dialog id>"] opens it as a modal
 *   [data-dialog-close] closes the dialog it sits in
 * The browser provides the focus trap, Escape and focus return. A click on
 * the backdrop (the <dialog> element itself) closes it as well, but only when
 * the press also started there, so a text selection dragged out of a field
 * doesn't dismiss the form.
 */
export function initOrderDialog() {
  document.addEventListener('click', (event) => {
    const opener = event.target.closest('[data-dialog-open]');
    if (opener) {
      const dialog = document.getElementById(opener.dataset.dialogOpen);
      if (dialog instanceof HTMLDialogElement && !dialog.open) dialog.showModal();
      return;
    }

    event.target.closest('[data-dialog-close]')?.closest('dialog')?.close();
  });

  for (const dialog of qsa('dialog')) {
    let pressedOnBackdrop = false;
    dialog.addEventListener('pointerdown', (event) => {
      pressedOnBackdrop = event.target === dialog;
    });
    dialog.addEventListener('click', (event) => {
      if (pressedOnBackdrop && event.target === dialog) dialog.close();
    });
  }
}
