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

  it('requires a sorting entry only when product grades are enabled', () => {
    const createProductParams = ({
      isActive,
      gradesEnabled,
      sortings,
    }: {
      isActive: boolean;
      gradesEnabled: boolean;
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
        gradesEnabled,
      });

    const sorting = new AddProductsSortingParams({ title: 'Sorting 1', price: 50 });
    const enabledWithoutSorting = createProductParams({
      isActive: true,
      gradesEnabled: true,
      sortings: [],
    }).validate();
    const enabledWithSorting = createProductParams({
      isActive: false,
      gradesEnabled: true,
      sortings: [sorting],
    }).validate();
    const disabledWithoutSorting = createProductParams({
      isActive: true,
      gradesEnabled: false,
      sortings: [],
    }).validate();

    expect(enabledWithoutSorting).toEqual({
      isValid: false,
      errors: [{ field: 'sortings', message: 'At least one sorting entry is required' }],
    });
    expect(enabledWithSorting.isValid).toBe(true);
    expect(disabledWithoutSorting.isValid).toBe(true);
  });
});
