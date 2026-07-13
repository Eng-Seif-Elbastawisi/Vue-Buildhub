import { describe, expect, it } from 'vitest';
import TranslationParams from '@/base/Core/Params/translationParams';
import EditTermParams from '../edit.term.params';

describe('EditTermParams', () => {
  it('maps update data', () => {
    expect(
      new EditTermParams({
        termId: 2,
        translations: new TranslationParams({ title: { en: 'Mall', ar: 'مول' } }),
      }).toMap(),
    ).toEqual({
      term_id: 2,
      translations: {
        title: { en: 'Mall', ar: 'مول' },
      },
    });
  });
});
