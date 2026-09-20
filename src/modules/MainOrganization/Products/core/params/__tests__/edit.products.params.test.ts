import { describe, expect, it } from 'vitest';
import TranslationParams from '@/base/Core/Params/translationParams';
import EditProductsParams from '../edit.products.params';

describe('EditProductsParams', () => {
  it('includes an inactive state in the update payload', () => {
    const params = new EditProductsParams({
      productsId: 6,
      translations: new TranslationParams({ title: { en: 'Door' } }),
      isActive: false,
    });

    expect(params.toMap()).toMatchObject({ product_id: 6, is_active: false });
  });
});
