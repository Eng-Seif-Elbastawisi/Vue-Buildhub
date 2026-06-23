import { describe, expect, it } from 'vitest';
import { LocationTypeEnum } from '../../constant/location.type.enum';
import AddLocationParams from '../add.location.params';
import TranslationParams from '@/base/Core/Params/translationParams';

const translations = new TranslationParams({ title: { en: 'Building', ar: 'مبنى' } });

describe('AddLocationParams', () => {
  it('maps and validates location create payloads', () => {
    const params = new AddLocationParams({
      parentId: 2,
      code: 'B-01',
      type: LocationTypeEnum.CITY,
      translations,
    });

    expect(params.toMap()).toEqual({
      parent_id: 2,
      code: 'B-01',
      type: LocationTypeEnum.CITY,
      translations: { title: { en: 'Building', ar: 'مبنى' } },
    });
    expect(params.validate().isValid).toBe(true);
  });
});
