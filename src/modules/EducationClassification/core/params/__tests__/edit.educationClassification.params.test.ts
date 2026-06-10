import { describe, it, expect } from 'vitest';
import EditEducationClassificationParams from '../edit.educationClassification.params';
import TranslationParams from '@/modules/about/core/params/translation.params';

describe('EditEducationClassificationParams', () => {
  it('should create an instance with correct data', () => {
    const translations = new TranslationParams({ title: { en: 'Basic Education' } });
    const params = new EditEducationClassificationParams({ id: 1, translations });

    expect(params.id).toBe(1);
    expect(params.translations.title?.en).toBe('Basic Education');
  });

  it('should map to an object correctly', () => {
    const translations = new TranslationParams({ title: { en: 'Higher Education' } });
    const params = new EditEducationClassificationParams({ id: 1, translations });

    const map = params.toMap();
    expect(map).toEqual({
      education_classification_id: 1,
      translations: { title: { en: 'Higher Education' }, description: undefined },
    });
  });

  it('should validate correctly with valid data', () => {
    const translations = new TranslationParams({ title: { en: 'Basic Education' } });
    const params = new EditEducationClassificationParams({ id: 1, translations });

    const result = params.validate();
    expect(result.isValid).toBe(true);
  });
});
