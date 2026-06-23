import { describe, expect, it } from 'vitest';
import { LocationTypeEnum } from '../../constant/location.type.enum';
import EditLocationParams from '../edit.location.params';
import TranslationParams from '@/base/Core/Params/translationParams';

const translations = new TranslationParams({ title: { en: 'Building', ar: 'مبنى' } });

describe('EditLocationParams', () => {
  it('maps and validates location update payloads', () => {
    const params = new EditLocationParams({
      location_id: 3,
      parentId: 2,
      code: 'B-01',
      type: LocationTypeEnum.CITY,
      translations,
    });

    expect(params.toMap()).toEqual({
      location_id: 3,
      parent_id: 2,
      code: 'B-01',
      type: LocationTypeEnum.CITY,
      translations: { title: { en: 'Building', ar: 'مبنى' } },
    });
    expect(params.validate().isValid).toBe(true);
  });
});
