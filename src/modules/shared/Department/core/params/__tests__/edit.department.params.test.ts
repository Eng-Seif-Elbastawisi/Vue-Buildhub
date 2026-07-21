import { describe, expect, it } from 'vitest';
import TranslationParams from '@/base/Core/Params/translationParams';
import { Type } from '../../constants/Type.enum';
import EditDepartmentParams from '../edit.department.params';

describe('EditDepartmentParams', () => {
  it('serializes id, translated title, stage_id, and department type', () => {
    const translations = new TranslationParams({ title: { en: 'Science', ar: 'العلوم' } });

    expect(
      new EditDepartmentParams({
        id: 5,
        translations,
        stageId: 2,
        type: Type.SUPERVISION,
      }).toMap(),
    ).toEqual({
      department_id: 5,
      translations,
      stage_id: 2,
      type: Type.SUPERVISION,
    });
  });

  it('requires stageId when type is not supervision', () => {
    const translations = new TranslationParams({ title: { en: 'Science' } });
    const params = new EditDepartmentParams({ id: 5, translations, type: Type.BOTH });

    expect(params.validate()).toMatchObject({
      isValid: false,
      errors: expect.arrayContaining([expect.objectContaining({ field: 'stageId' })]),
    });
  });

  it('allows stageId to be omitted when type is supervision', () => {
    const translations = new TranslationParams({ title: { en: 'Science' } });
    const params = new EditDepartmentParams({ id: 5, translations, type: Type.SUPERVISION });

    expect(params.validate()).toEqual({ isValid: true, errors: [] });
  });
});
