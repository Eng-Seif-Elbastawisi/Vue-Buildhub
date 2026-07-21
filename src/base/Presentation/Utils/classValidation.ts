import { dialogManager } from '@/base/Presentation/Dialogs/dialog.manager';
import { translate } from '@/locales/i18n';

// class_validation.ts
export interface ValidationRule {
  required?: boolean | ((record: Record<string, unknown>) => boolean);
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: RegExp;
  custom?: (value: any) => boolean | string;
}

export interface FieldError {
  field: string;
  message: string;
}

export class ClassValidation {
  private rules: Map<string, ValidationRule> = new Map();

  setRule(field: string, rule: ValidationRule): this {
    this.rules.set(field, rule);
    return this;
  }

  setRules(rules: Record<string, ValidationRule>): this {
    Object.entries(rules).forEach(([field, rule]) => {
      this.rules.set(field, rule);
    });
    return this;
  }

  require(field: string): this {
    const existing = this.rules.get(field) || {};
    this.rules.set(field, { ...existing, required: true });
    return this;
  }

  optional(field: string): this {
    const existing = this.rules.get(field) || {};
    this.rules.set(field, { ...existing, required: false });
    return this;
  }

  validate(obj: any): { isValid: boolean; errors: FieldError[] } {
    const errors: FieldError[] = [];

    this.rules.forEach((rule, field) => {
      const value = obj[field];
      const isRequired =
        typeof rule.required === 'function' ? rule.required(obj) : Boolean(rule.required);

      if (isRequired && this.isEmpty(value)) {
        errors.push({ field, message: translate('validation.required', { field }) });
        return;
      }

      if (!isRequired && this.isEmpty(value)) {
        return;
      }

      if (
        rule.minLength !== undefined &&
        typeof value === 'string' &&
        value.length < rule.minLength
      ) {
        errors.push({
          field,
          message: translate('validation.min_length', { field, min: rule.minLength }),
        });
      }

      if (
        rule.maxLength !== undefined &&
        typeof value === 'string' &&
        value.length > rule.maxLength
      ) {
        errors.push({
          field,
          message: translate('validation.max_length', { field, max: rule.maxLength }),
        });
      }

      if (rule.min !== undefined && typeof value === 'number' && value < rule.min) {
        errors.push({
          field,
          message: translate('validation.min', { field, min: rule.min }),
        });
      }

      if (rule.max !== undefined && typeof value === 'number' && value > rule.max) {
        errors.push({ field, message: translate('validation.max', { field, max: rule.max }) });
      }

      if (rule.pattern && typeof value === 'string' && !rule.pattern.test(value)) {
        errors.push({ field, message: translate('validation.invalid_format', { field }) });
      }

      if (rule.custom) {
        const result = rule.custom(value);
        if (result !== true) {
          errors.push({
            field,
            message:
              typeof result === 'string' ? result : translate('validation.invalid', { field }),
          });
        }
      }
    });

    return { isValid: errors.length === 0, errors };
  }

  validateOrThrow(obj: any): void {
    const { isValid, errors } = this.validate(obj);
    if (!isValid) {
      const validationError = new ValidationError(errors);
      validationError.openDialog();
    }
  }

  private isEmpty(value: any): boolean {
    if (value === null || value === undefined) return true;
    if (typeof value === 'string' && value.trim() === '') return true;
    if (Array.isArray(value) && value.length === 0) return true;
    return false;
  }
}

export class ValidationError extends Error {
  errors: FieldError[];

  constructor(errors: FieldError[]) {
    super(`Validation failed: ${errors.map((e) => `${e.field}: ${e.message}`).join(', ')}`);
    this.errors = errors;
    this.name = 'ValidationError';
  }

  openDialog() {
    dialogManager.toastWarning(this.errors.map((e) => `${e.field}: ${e.message}`).join('\n'));
  }
}
