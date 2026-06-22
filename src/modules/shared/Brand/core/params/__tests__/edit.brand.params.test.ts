import { describe, expect, it } from 'vitest';
import TranslationParams from '@/base/Core/Params/translationParams';
import { BrandTypeEnum } from '../../constant/Brand.type.enum';
import EditBrandParams from '../edit.brand.params';

describe('EditBrandParams', () => {
  it('maps and validates the brand update payload', () => {
    const translations = new TranslationParams({
      title: { en: 'Acme', ar: 'أكمي' },
    });
    const params = new EditBrandParams({
      brand_id: 4,
      translations,
      type: BrandTypeEnum.SUPPLIES,
    });

    expect(params.toMap()).toEqual({
      brand_id: 4,
      translations,
      type: BrandTypeEnum.SUPPLIES,
    });
    expect(params.validate().isValid).toBe(true);
  });
});
