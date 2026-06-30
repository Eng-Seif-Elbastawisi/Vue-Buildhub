import { describe, expect, it } from 'vitest';
import TranslationParams from '@/base/Core/Params/translationParams';
import AddSpaceParams from '../add.space.params';

describe('AddSpaceParams', () => {
  it('maps create data', () => {
    expect(
      new AddSpaceParams({
        translations: new TranslationParams({ title: { en: 'Mall', ar: 'مول' } }),
      }).toMap(),
    ).toEqual({
      translations: {
        title: { en: 'Mall', ar: 'مول' },
      },
    });
  });
});
