import { describe, it, expect } from 'vitest';
import TranslationParams from '../translation.params';

describe('TranslationParams', () => {
  it('should create an instance with correct data', () => {
    const data = {
      SingularTitle: { en: 'Category', ar: 'الفئة' },
      PluralTitle: { en: 'Categories', ar: 'الفئات' },
    };
    const params = new TranslationParams(data);
    expect(params.SingularTitle).toEqual(data.SingularTitle);
    expect(params.PluralTitle).toEqual(data.PluralTitle);
  });

  it('should map to an object correctly', () => {
    const data = {
      SingularTitle: { en: 'S', ar: 'S' },
      PluralTitle: { en: 'P', ar: 'P' },
    };
    const params = new TranslationParams(data);
    const map = params.toMap();
    expect(map).toEqual({
      singular_title: data.SingularTitle,
      plural_title: data.PluralTitle,
    });
  });
});
