import { describe, expect, it } from 'vitest';
import TranslationParams from '@/base/Core/Params/translationParams';
import { BrandTypeEnum } from '../../constant/Brand.type.enum';
import AddBrandParams from '../add.brand.params';

describe('Brand add params current contract suite', () => {
  it('maps and validates the brand create payload', () => {
    const translations = new TranslationParams({
      title: { en: 'Acme', ar: 'أكمي' },
    });
    const params = new AddBrandParams({
      translations,
      type: BrandTypeEnum.MATERIALS,
    });

    expect(params.toMap()).toEqual({
      translations,
      type: BrandTypeEnum.MATERIALS,
    });
    expect(params.validate().isValid).toBe(true);
  });

  it('requires brand type selection', () => {
    const params = new AddBrandParams({
      translations: new TranslationParams({
        title: { en: 'Acme' },
      }),
    });

    expect(params.validate()).toMatchObject({
      isValid: false,
      errors: [{ field: 'type' }],
    });
  });
});
