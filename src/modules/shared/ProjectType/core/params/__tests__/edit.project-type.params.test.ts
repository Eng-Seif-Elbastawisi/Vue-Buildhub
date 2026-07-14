import { describe, expect, it } from 'vitest';
import TranslationParams from '@/base/Core/Params/translationParams';
import EditProjectTypeParams from '../edit.project-type.params';

describe('EditProjectTypeParams', () => {
  it('maps update data', () => {
    expect(
      new EditProjectTypeParams({
        projectId: 2,
        name: 'Mall',
        projectType: 4,
        translations: new TranslationParams({ title: { en: 'Mall', ar: 'مول' } }),
      }).toMap(),
    ).toEqual({
      project_type_id: 2,
      name: 'Mall',
      project_type: 4,
      translations: {
        title: { en: 'Mall', ar: 'مول' },
      },
    });
  });

  it('requires at least one title translation', () => {
    const params = new EditProjectTypeParams({
      projectId: 2,
      translations: new TranslationParams({ title: { en: '', ar: '   ' } }),
    });

    expect(params.validate()).toMatchObject({
      isValid: false,
      errors: [{ field: 'translations' }],
    });
  });
});
