import { describe, expect, it } from 'vitest';
import TranslationParams from '@/base/Core/Params/translationParams';
import EditSpecializationParams from '../edit.specialization.params';

describe('EditSpecializationParams', () => {
  it('maps update data', () => {
    expect(
      new EditSpecializationParams({
        specializationId: 2,
        translations: new TranslationParams({ title: { en: 'Mall', ar: 'مول' } }),
      }).toMap(),
    ).toEqual({
      specialization_id: 2,
      translations: {
        title: { en: 'Mall', ar: 'مول' },
      },
    });
  });
});
