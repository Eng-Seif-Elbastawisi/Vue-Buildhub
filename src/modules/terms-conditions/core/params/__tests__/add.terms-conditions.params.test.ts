import { describe, it, expect } from 'vitest';
import AddTermsConditionsParams from '../add.terms-conditions.params';
import type TranslationParams from '@/modules/about/core/params/translation.params';

describe('AddTermsConditionsParams', () => {
  const mockTranslations: TranslationParams = {
    title: { ar: 'العنوان', en: 'Title' },
    description: { ar: 'الوصف', en: 'Description' },
  };

  it('should create an instance with correct data', () => {
    const params = new AddTermsConditionsParams({
      translations: mockTranslations,
    });

    expect(params.translations).toEqual(mockTranslations);
  });

  it('should map to an object correctly', () => {
    const params = new AddTermsConditionsParams({
      translations: mockTranslations,
    });

    const map = params.toMap();
    expect(map).toEqual({
      translations: mockTranslations,
    });
  });

  it('should validate correctly with valid data', () => {
    const params = new AddTermsConditionsParams({
      translations: mockTranslations,
    });

    const result = params.validate();
    expect(result.isValid).toBe(true);
  });

  it('should fail validation with missing translations', () => {
    const params = new AddTermsConditionsParams({
      translations: null as any,
    });

    const result = params.validate();
    expect(result.isValid).toBe(false);
  });
});
