import { describe, expect, it } from 'vitest';
import TranslationParams from '@/base/Core/Params/translationParams';
import { Type } from '../../constants/Type.enum';
import AddDepartmentParams from '../add.department.params';

describe('AddDepartmentParams', () => {
  it('serializes translated title, stage_id, and department type', () => {
    const translations = new TranslationParams({ title: { en: 'Science', ar: 'العلوم' } });

    expect(
      new AddDepartmentParams({ translations, stageId: 2, type: Type.DESIGN }).toMap(),
    ).toEqual({
      translations,
      stage_id: 2,
      type: Type.DESIGN,
    });
  });

  it('requires stageId when type is not supervision', () => {
    const translations = new TranslationParams({ title: { en: 'Science' } });
    const params = new AddDepartmentParams({ translations, type: Type.DESIGN });

    expect(params.validate()).toMatchObject({
      isValid: false,
      errors: expect.arrayContaining([expect.objectContaining({ field: 'stageId' })]),
    });
  });

  it('allows stageId to be omitted when type is supervision', () => {
    const translations = new TranslationParams({ title: { en: 'Science' } });
    const params = new AddDepartmentParams({ translations, type: Type.SUPERVISION });

    expect(params.validate()).toEqual({ isValid: true, errors: [] });
  });
});
