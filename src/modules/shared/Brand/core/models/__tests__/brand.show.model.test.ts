import { describe, expect, it } from 'vitest';
import { BrandTypeEnum } from '../../constant/Brand.type.enum';
import BrandShowModel from '../brand.show.model';

describe('BrandShowModel', () => {
  it('maps all brand translations and freezes the instance', () => {
    const model = BrandShowModel.fromJson({
      id: 2,
      title: [
        { locale: 'ar', title: 'أكمي' },
        { locale: 'en', title: 'Acme' },
      ],
      type: BrandTypeEnum.MATERIALS,
    });

    expect(model).toMatchObject({
      id: 2,
      translations: { title: { en: 'Acme', ar: 'أكمي' } },
      type: BrandTypeEnum.MATERIALS,
    });
    expect(Object.isFrozen(model)).toBe(true);
  });

  it('falls back to the localized title and rejects empty JSON', () => {
    expect(BrandShowModel.fromJson({ title: 'Acme' }).translations.title).toEqual({ en: 'Acme' });
    expect(() => BrandShowModel.fromJson(null)).toThrow('Invalid BrandShowModel data');
  });
});
