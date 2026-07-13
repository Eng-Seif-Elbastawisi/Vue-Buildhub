import { describe, expect, it } from 'vitest';
import TranslationParams from '@/base/Core/Params/translationParams';
import AddTermParams from '../add.term.params';

describe('AddTermParams', () => {
  it('maps create data', () => {
    expect(
      new AddTermParams({
        translations: new TranslationParams({ title: { en: 'Mall', ar: 'مول' } }),
      }).toMap(),
    ).toEqual({
      translations: {
        title: { en: 'Mall', ar: 'مول' },
      },
    });
  });
});
