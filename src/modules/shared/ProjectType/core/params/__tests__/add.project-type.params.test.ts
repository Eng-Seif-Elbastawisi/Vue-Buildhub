import { describe, expect, it } from 'vitest';
import TranslationParams from '@/base/Core/Params/translationParams';
import AddProjectTypeParams from '../add.project-type.params';

describe('AddProjectTypeParams', () => {
  it('maps create data', () => {
    expect(
      new AddProjectTypeParams({
        name: 'Mall',
        projectType: 4,
        translations: new TranslationParams({ title: { en: 'Mall', ar: 'مول' } }),
      }).toMap(),
    ).toEqual({
      name: 'Mall',
      project_type: 4,
      translations: {
        title: { en: 'Mall', ar: 'مول' },
      },
    });
  });

  it('requires at least one title translation', () => {
    const params = new AddProjectTypeParams({
      translations: new TranslationParams({ title: { en: ' ', ar: '' } }),
    });

    expect(params.validate()).toMatchObject({
      isValid: false,
      errors: [{ field: 'translations' }],
    });
  });
});
