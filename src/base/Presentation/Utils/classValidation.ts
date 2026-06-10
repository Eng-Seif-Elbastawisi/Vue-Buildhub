import { dialogManager } from '@/base/Presentation/Dialogs/dialog.manager';

// class_validation.ts
export interface ValidationRule {
  required?: boolean;
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

      if (rule.required && this.isEmpty(value)) {
        errors.push({ field, message: `${field} is required` });
        return;
      }

      if (!rule.required && this.isEmpty(value)) {
        return;
      }

      if (
        rule.minLength !== undefined &&
        typeof value === 'string' &&
        value.length < rule.minLength
      ) {
        errors.push({
          field,
          message: `${field} must be at least ${rule.minLength} characters`,
        });
      }

      if (
        rule.maxLength !== undefined &&
        typeof value === 'string' &&
        value.length > rule.maxLength
      ) {
        errors.push({
          field,
          message: `${field} must be at most ${rule.maxLength} characters`,
        });
      }

      if (rule.min !== undefined && typeof value === 'number' && value < rule.min) {
        errors.push({
          field,
          message: `${field} must be at least ${rule.min}`,
        });
      }

      if (rule.max !== undefined && typeof value === 'number' && value > rule.max) {
        errors.push({ field, message: `${field} must be at most ${rule.max}` });
      }

      if (rule.pattern && typeof value === 'string' && !rule.pattern.test(value)) {
        errors.push({ field, message: `${field} format is invalid` });
      }

      if (rule.custom) {
        const result = rule.custom(value);
        if (result !== true) {
          errors.push({
            field,
            message: typeof result === 'string' ? result : `${field} is invalid`,
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
