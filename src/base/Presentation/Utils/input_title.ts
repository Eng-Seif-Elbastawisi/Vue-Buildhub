import type TranslationParams from '@/base/Core/Params/translationParams';
import type { ValidationRule } from '@/base/Presentation/Utils/classValidation';
import { translate } from '@/locales/i18n';

export const hasTitleTranslation = (translations?: TranslationParams) => {
  return Object.values(translations?.title ?? {}).some(
    (value) => typeof value === 'string' && value.trim().length > 0,
  );
};

export const hasSelectValue = (value?: unknown): boolean => {
  if (value === null || value === undefined) return false;

  if (typeof value === 'string') {
    return value.trim().length > 0;
  }

  if (typeof value === 'number') {
    return Number.isFinite(value);
  }

  if (Array.isArray(value)) {
    return value.some((item) => hasSelectValue(item));
  }

  if (typeof value === 'object') {
    if ('id' in value) {
      return hasSelectValue((value as { id?: unknown }).id);
    }

    return Object.keys(value).length > 0;
  }

  return true;
};

export const requiredSelectRule = (): ValidationRule => ({
  required: true,
  custom: (value) => hasSelectValue(value) || translate('validation.select_required'),
});
