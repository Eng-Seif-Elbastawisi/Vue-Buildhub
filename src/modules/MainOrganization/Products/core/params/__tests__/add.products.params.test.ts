import { describe, expect, it } from 'vitest';
import TranslationParams from '@/base/Core/Params/translationParams';
import AddProductsParams from '../add.products.params';
import AddProductsSortingParams from '../add.products.sorting.params';

describe('AddProductsParams', () => {
  it('includes the active state in the create payload', () => {
    const params = new AddProductsParams({
      translations: new TranslationParams({ title: { en: 'Door' } }),
      isActive: true,
    });

    expect(params.toMap()).toMatchObject({ is_active: true });
  });

  it('requires at least one sorting entry only when the product is active', () => {
    const createProductParams = ({
      isActive,
      sortings,
    }: {
      isActive: boolean;
      sortings: AddProductsSortingParams[];
    }) =>
      new AddProductsParams({
        translations: new TranslationParams({ title: { en: 'Door' } }),
        itemTypeId: 1,
        measurementUnitId: 2,
        expectedPrice: 100,
        stageIds: [3],
        sortings,
        isActive,
      });

    const sorting = new AddProductsSortingParams({ title: 'Sorting 1', price: 50 });
    const activeWithoutSorting = createProductParams({ isActive: true, sortings: [] }).validate();
    const activeWithSorting = createProductParams({
      isActive: true,
      sortings: [sorting],
    }).validate();
    const inactiveWithoutSorting = createProductParams({
      isActive: false,
      sortings: [],
    }).validate();

    expect(activeWithoutSorting).toEqual({
      isValid: false,
      errors: [{ field: 'sortings', message: 'At least one sorting entry is required' }],
    });
    expect(activeWithSorting.isValid).toBe(true);
    expect(inactiveWithoutSorting.isValid).toBe(true);
  });
});
