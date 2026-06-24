import { describe, expect, it } from 'vitest';
import { UnitTypeEnum } from '../../constant/unit.type.enum';
import SupplyModel from '../supply.model';

describe('SupplyModel', () => {
  it('maps API translations and supports snake-case brand id', () => {
    const model = SupplyModel.fromJson({
      id: 4,
      brand_id: 7,
      price: '125',
      unit: UnitTypeEnum.bag,
      translations: [
        { locale: 'en', title: 'Cement' },
        { locale: 'ar', title: 'Cement AR' },
      ],
    });

    expect(model).toMatchObject({
      id: 4,
      brandId: 7,
      price: 125,
      unit: UnitTypeEnum.bag,
      translations: { title: { en: 'Cement', ar: 'Cement AR' } },
    });
  });
});
