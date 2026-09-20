import { describe, expect, it } from 'vitest';
import { UnitTypeEnum } from '../../constant/unit.type.enum';
import MaterialsModel from '../materials.model';

describe('MaterialsModel', () => {
  it('maps API translations and supports snake-case brand id', () => {
    const model = MaterialsModel.fromJson({
      id: 4,
      brand_id: 7,
      price: '125',
      unit: UnitTypeEnum.bag,
      translations: [
        { locale: 'en', title: 'Cement' },
        { locale: 'ar', title: 'Cement AR' },
      ],
      status: 1,
    });

    expect(model).toMatchObject({
      id: 4,
      brandId: 7,
      price: 125,
      unit: UnitTypeEnum.bag,
      translations: { title: { en: 'Cement', ar: 'Cement AR' } },
      status: true,
    });
  });
});
