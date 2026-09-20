import { describe, expect, it } from 'vitest';
import TranslationParams from '@/base/Core/Params/translationParams';
import AddProductsParams from '../add.products.params';

describe('AddProductsParams', () => {
  it('includes the active state in the create payload', () => {
    const params = new AddProductsParams({
      translations: new TranslationParams({ title: { en: 'Door' } }),
      isActive: true,
    });

    expect(params.toMap()).toMatchObject({ is_active: true });
  });
});
