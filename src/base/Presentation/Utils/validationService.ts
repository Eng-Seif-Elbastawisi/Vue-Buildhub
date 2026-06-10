import { ref } from 'vue';
import { dialogManager } from '@/base/Presentation/Dialogs/dialog.manager';

class ValidationService {
  isOpen = ref(false);
  message = ref('');
  mode = ref<'dialog' | 'inline' | 'both'>('dialog');
  inlineErrors = ref<Record<string, string>>({});

  // Clear error for a specific field
  clearError(fieldName: string) {
    const inputField = document.getElementById(fieldName);
    if (inputField) {
      const errorSpan = inputField.nextElementSibling;
      if (errorSpan && errorSpan.classList.contains('error-text')) {
        errorSpan.remove();
      }
    }
  }

  // Append error for a specific field
  appendError(fieldName: string, errorMessage: string) {
    const inputField = document.getElementById(fieldName);
    if (inputField) {
      let errorSpan = inputField.nextElementSibling;
      if (errorSpan && errorSpan.classList.contains('error-text')) {
        errorSpan.textContent = errorMessage;
      } else {
        errorSpan = document.createElement('span');
        errorSpan.classList.add('text-sm', 'text-red-500', 'error-text');
        errorSpan.textContent = errorMessage;
        inputField.parentNode?.insertBefore(errorSpan, inputField.nextSibling);
      }
    }
  }

  // Clear all errors
  clearErrors() {
    const errorSpans = document.querySelectorAll('.error-text');
    errorSpans.forEach((span) => span.remove());
  }

  // Monitor input changes and remove error when valid
  monitorInputChanges(fieldName: string) {
    const inputField = document.getElementById(fieldName) as HTMLInputElement | null;
    if (inputField) {
      inputField.addEventListener('input', () => {
        if (inputField.value?.trim() !== '') {
          this.clearError(fieldName);
          delete this.inlineErrors.value[fieldName];
        }
      });
    }
  }

  // Validate and show errors
  validate(errors: Record<string, string>, mode: 'dialog' | 'inline' | 'both' = 'dialog') {
    this.mode.value = mode;

    if (mode === 'dialog') {
      if (errors && Object.values(errors).length > 0) {
        this.message.value = Object.values(errors)[0] ?? '';
        dialogManager.error(this.message.value);
      }
      this.isOpen.value = true;
    } else if (mode === 'inline') {
      this.inlineErrors.value = errors;
      Object.keys(errors).forEach((field) => {
        this.appendError(field, errors[field] as string);
        this.monitorInputChanges(field); // Monitor changes for inline errors
      });
    } else {
      if (errors && Object.values(errors).length > 0) {
        this.message.value = Object.values(errors)[0] ?? '';
        dialogManager.error(this.message.value);
      }
      this.isOpen.value = true;
      this.inlineErrors.value = errors;
      Object.keys(errors).forEach((field) => {
        this.appendError(field, errors[field] as string);
        this.monitorInputChanges(field); // Monitor changes for both modes
      });
    }
  }

  // Clear all validation states
  clearValidation() {
    this.isOpen.value = false;
    this.message.value = '';
    this.inlineErrors.value = {};
    this.clearErrors();
  }
}

export default new ValidationService();
