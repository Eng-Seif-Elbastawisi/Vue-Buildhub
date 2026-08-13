import { afterEach, describe, expect, it, vi } from 'vitest';
import { dialogManager } from '@/base/Presentation/Dialogs/dialog.manager';
import { i18n } from '@/locales/i18n';
import { ClassValidation, ValidationError } from '../classValidation';

const originalLocale = i18n.global.locale;

afterEach(() => {
  i18n.global.locale = originalLocale;
  vi.restoreAllMocks();
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

  it('shows validation messages without internal field names', () => {
    const warningToast = vi
      .spyOn(dialogManager, 'toastWarning')
      .mockReturnValue('validation-warning');
    const validationError = new ValidationError([
      { field: 'department_id', message: 'القسم مطلوب' },
    ]);

    validationError.openDialog();

    expect(warningToast).toHaveBeenCalledWith('القسم مطلوب');
  });
});
