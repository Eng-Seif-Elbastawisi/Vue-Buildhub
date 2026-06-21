import { describe, expect, it } from 'vitest';
import { LocationTypeEnum } from '../../constant/location.type.enum';
import LocationModel from '../location.model';

describe('LocationModel', () => {
  it('maps API translations and snake-case parent id', () => {
    const model = LocationModel.fromJson({
      id: 4,
      parent_id: 7,
      code: 'B-01',
      type: LocationTypeEnum.building,
      translations: [
        { locale: 'en', title: 'Building' },
        { locale: 'ar', title: 'مبنى' },
      ],
    });

    expect(model).toMatchObject({
      id: 4,
      parentId: 7,
      code: 'B-01',
      type: LocationTypeEnum.building,
      translations: { title: { en: 'Building', ar: 'مبنى' } },
    });
  });
});
