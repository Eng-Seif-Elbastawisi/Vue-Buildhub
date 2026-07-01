import { describe, expect, it } from 'vitest';
import TranslationParams from '@/base/Core/Params/translationParams';
import EditDepartmentParams from '../edit.department.params';

describe('EditDepartmentParams', () => {
  it('serializes id, translated title, and stage_id', () => {
    const translations = new TranslationParams({ title: { en: 'Science', ar: 'العلوم' } });

    expect(new EditDepartmentParams({ id: 5, translations, stageId: 2 }).toMap()).toEqual({
      department_id: 5,
      translations,
      stage_id: 2,
    });
  });
});
