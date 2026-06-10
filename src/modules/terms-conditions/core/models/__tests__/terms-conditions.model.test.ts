import { describe, it, expect } from 'vitest';
import TermsConditionsModel from '../terms-conditions.model';
import TranslationModel from '@/modules/about/core/models/translation.model';

describe('TermsConditionsModel', () => {
  it('should create instance from json', () => {
    const json = {
      translations: {
        title: { ar: 'عنوان', en: 'title' },
        description: { ar: 'وصف', en: 'desc' },
      },
    };

    const model = TermsConditionsModel.fromJson(json);

    expect(model).toBeInstanceOf(TermsConditionsModel);
    expect(model.translations).toBeInstanceOf(TranslationModel);
    expect(model.translations.title.en).toBe('title');
  });

  it('should throw error if json is null', () => {
    expect(() => {
      TermsConditionsModel.fromJson(null);
    }).toThrow();
  });

  it('should use example correctly', () => {
    expect(TermsConditionsModel.example).toBeDefined();
    expect(TermsConditionsModel.example.translations.title.en).toBe('terms_conditions_en');
  });
});
