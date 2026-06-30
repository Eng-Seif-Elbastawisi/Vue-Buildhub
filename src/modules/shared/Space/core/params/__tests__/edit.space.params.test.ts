import { describe, expect, it } from 'vitest';
import TranslationParams from '@/base/Core/Params/translationParams';
import EditSpaceParams from '../edit.space.params';

describe('EditSpaceParams', () => {
  it('maps update data', () => {
    expect(
      new EditSpaceParams({
        spaceId: 2,
        translations: new TranslationParams({ title: { en: 'Mall', ar: 'مول' } }),
      }).toMap(),
    ).toEqual({
      space_id: 2,
      translations: {
        title: { en: 'Mall', ar: 'مول' },
      },
    });
  });
});
