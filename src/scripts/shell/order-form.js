import { qs } from '../lib/dom.js';
import { scrollBehavior } from '../lib/motion.js';
import { submitOrder } from '../services/order.js';
import { statusMessage } from '../ui/status.js';

const MAX_UPLOAD_BYTES = 20 * 1024 * 1024;
const TEL_MESSAGE = 'Enter a phone number with country code, e.g. +7 999 123-45-67.';

/* Checks the HTML constraint attributes can't express. */
const customChecks = {
  tel(field) {
    const digits = field.value.replace(/\D/g, '').length;
    const valid = !field.value || (digits >= 10 && digits <= 15);
    field.setCustomValidity(valid ? '' : TEL_MESSAGE);
  },
  file(field) {
    const total = [...field.files].reduce((sum, file) => sum + file.size, 0);
    field.setCustomValidity(
      total > MAX_UPLOAD_BYTES ? 'Attachments must be 20 MB or less in total.' : ''
    );
  },
};

/** The error message for a field's current validity state ('' when valid). */
function messageFor(field) {
  const { validity } = field;
  if (validity.valid) return '';
  if (validity.valueMissing) {
    return field.type === 'checkbox'
      ? 'Please confirm your consent to continue.'
      : 'Please fill in this field.';
  }
  if (field.type === 'tel') return TEL_MESSAGE;
  if (field.type === 'email') return 'Enter an email address like name@company.com.';
  return field.validationMessage;
}

// Each control's error element is `#<control id>-error` (see order-dialog.html).
const errorFor = (field) => document.getElementById(`${field.id}-error`);

function showError(field, message) {
  field.setAttribute('aria-invalid', String(Boolean(message)));
  const error = errorFor(field);
  if (!error) return;
  error.textContent = message;
  error.hidden = !message;
}

function validate(field) {
  customChecks[field.type]?.(field);
  const message = messageFor(field);
  showError(field, message);
  return !message;
}

/**
 * Order form: Constraint Validation API with English messages tied to each
 * field via aria-describedby. Fields validate when the user leaves them, then
 * re-check live while invalid. Submitting shows the button spinner, then a
 * success or error message in the form's polite live region.
 */
export function initOrderForm() {
  const form = qs('[data-order-form]');
  if (!form) return;

  const submitButton = qs('[data-submit]', form);
  const status = qs('[data-form-status]', form);
  const fields = () => [...form.elements].filter((element) => element.willValidate);

  const setBusy = (busy) => {
    submitButton.dataset.loading = String(busy);
    form.setAttribute('aria-busy', String(busy));
  };

  form.addEventListener('change', (event) => {
    if (event.target.willValidate) validate(event.target);
  });

  form.addEventListener('input', (event) => {
    if (event.target.getAttribute('aria-invalid') === 'true') validate(event.target);
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (submitButton.dataset.loading === 'true') return;
    status.replaceChildren();

    const invalid = fields().filter((field) => !validate(field));
    if (invalid.length > 0) {
      invalid[0].focus();
      return;
    }

    const payload = new FormData(form);
    setBusy(true);
    try {
      await submitOrder(payload);
      form.reset();
      fields().forEach((field) => showError(field, ''));
      status.replaceChildren(
        statusMessage({
          tone: 'success',
          title: 'Request sent',
          message: 'Thank you! Our engineers will contact you within one business day.',
        })
      );
    } catch (error) {
      console.error(error);
      status.replaceChildren(
        statusMessage({
          tone: 'error',
          title: 'Request not sent',
          message: 'Something went wrong on our side. Please try again or call +7 929 119-44-05.',
        })
      );
    } finally {
      setBusy(false);
      // On small screens the result can sit below the fold of the dialog.
      status.scrollIntoView({ block: 'nearest', behavior: scrollBehavior() });
    }
  });

  // Start fresh each time the dialog is reopened.
  form.closest('dialog')?.addEventListener('close', () => status.replaceChildren());
}
