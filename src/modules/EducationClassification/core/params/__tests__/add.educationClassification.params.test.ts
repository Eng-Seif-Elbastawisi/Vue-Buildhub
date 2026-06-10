import { describe, it, expect } from 'vitest';
import AddEducationClassificationParams from '../add.educationClassification.params';
import TranslationParams from '@/modules/about/core/params/translation.params';

describe('AddEducationClassificationParams', () => {
  it('should create an instance with correct data', () => {
    const translation = new TranslationParams({ title: { en: 'Basic Education' } });
    const params = new AddEducationClassificationParams({ translation });

    expect(params.translation.title?.en).toBe('Basic Education');
  });

  it('should map to an object correctly', () => {
    const translation = new TranslationParams({ title: { en: 'Higher Education' } });
    const params = new AddEducationClassificationParams({ translation });

    const map = params.toMap();
    expect(map).toEqual({
      translations: { title: { en: 'Higher Education' }, description: undefined },
    });
  });

  it('should validate correctly with valid data', () => {
    const translation = new TranslationParams({ title: { en: 'Basic Education' } });
    const params = new AddEducationClassificationParams({ translation });

    const result = params.validate();
    expect(result.isValid).toBe(true);
  });
});
