import { describe, expect, it } from 'vitest';
import { BrandTypeEnum } from '../../constant/Brand.type.enum';
import BrandModel from '../brand.model';

describe('BrandModel', () => {
  it('maps brand translations and freezes the instance', () => {
    const model = BrandModel.fromJson({
      id: 1,
      translations: {
        title: [
          { locale: 'en', title: 'Acme' },
          { locale: 'ar', title: 'أكمي' },
        ],
      },
      type: BrandTypeEnum.MATERIALS,
    });

    expect(model).toMatchObject({
      id: 1,
      translations: { title: { en: 'Acme', ar: 'أكمي' } },
      type: BrandTypeEnum.MATERIALS,
    });
    expect(Object.isFrozen(model)).toBe(true);
  });

  it('throws for empty JSON and exposes an example', () => {
    expect(() => BrandModel.fromJson(null)).toThrow('Cannot create SuppliersModel');
    expect(BrandModel.example).toBeInstanceOf(BrandModel);
  });
});
