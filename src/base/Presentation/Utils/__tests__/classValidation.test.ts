import { afterEach, describe, expect, it } from 'vitest';
import { i18n } from '@/locales/i18n';
import { ClassValidation } from '../classValidation';

const originalLocale = i18n.global.locale;

afterEach(() => {
  i18n.global.locale = originalLocale;
});

describe('ClassValidation', () => {
  it('uses translated readable labels in validation messages', () => {
    const validation = new ClassValidation().setRules({
      department_id: { required: true },
    });

    expect(validation.validate({ department_id: undefined }).errors).toEqual([
      { field: 'department_id', message: 'Department is required' },
    ]);
  });

  it('supports a translated label override when the parameter property is generic', () => {
    const validation = new ClassValidation().setRules({
      id: { labelKey: 'department_id', required: true },
    });

    expect(validation.validate({ id: undefined }).errors).toEqual([
      { field: 'id', message: 'Department is required' },
    ]);
  });

  it('uses the active locale for field labels', () => {
    i18n.global.locale = 'ar';
    const validation = new ClassValidation().setRules({ email: { required: true } });

    expect(validation.validate({ email: undefined }).errors).toEqual([
      { field: 'email', message: 'البريد الإلكتروني مطلوب' },
    ]);
  });
});
