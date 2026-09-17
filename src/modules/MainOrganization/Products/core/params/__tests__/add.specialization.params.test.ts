import { describe, expect, it } from 'vitest';
import TranslationParams from '@/base/Core/Params/translationParams';
import AddSpecializationParams from '../add.specialization.params';

describe('AddSpecializationParams', () => {
  it('maps create data', () => {
    expect(
      new AddSpecializationParams({
        translations: new TranslationParams({ title: { en: 'Mall', ar: 'مول' } }),
      }).toMap(),
    ).toEqual({
      translations: {
        title: { en: 'Mall', ar: 'مول' },
      },
    });
  });
});
