import { describe, expect, it } from 'vitest';
import TranslationParams from '@/base/Core/Params/translationParams';
import AddDepartmentParams from '../add.department.params';

describe('AddDepartmentParams', () => {
  it('serializes translated title and stage_id', () => {
    const translations = new TranslationParams({ title: { en: 'Science', ar: 'العلوم' } });

    expect(new AddDepartmentParams({ translations, stageId: 2 }).toMap()).toEqual({
      translations,
      stage_id: 2,
    });
  });
});
