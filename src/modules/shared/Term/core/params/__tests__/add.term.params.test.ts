import { describe, expect, it } from 'vitest';
import TranslationParams from '@/base/Core/Params/translationParams';
import AddTermParams from '../add.term.params';

describe('AddTermParams', () => {
  it('serializes translated title and department_id', () => {
    const translations = new TranslationParams({ title: { en: 'First Term', ar: 'الفصل الأول' } });

    expect(new AddTermParams({ translations, departmentId: 2 }).toMap()).toEqual({
      translations,
      department_id: 2,
    });
  });
});
