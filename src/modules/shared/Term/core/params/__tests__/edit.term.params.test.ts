import { describe, expect, it } from 'vitest';
import TranslationParams from '@/base/Core/Params/translationParams';
import EditTermParams from '../edit.term.params';

describe('EditTermParams', () => {
  it('serializes id, translated title, and department_id', () => {
    const translations = new TranslationParams({ title: { en: 'First Term', ar: 'الفصل الأول' } });

    expect(new EditTermParams({ id: 5, translations, departmentId: 2 }).toMap()).toEqual({
      id: 5,
      translations,
      department_id: 2,
    });
  });
});
