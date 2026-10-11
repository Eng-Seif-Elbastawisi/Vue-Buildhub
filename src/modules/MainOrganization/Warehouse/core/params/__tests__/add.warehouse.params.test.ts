import { describe, expect, it } from 'vitest';
import TranslationParams from '@/base/Core/Params/translationParams';
import AddWarehouseParams from '../add.warehouse.params';

describe('AddWarehouseParams', () => {
  it('maps create data', () => {
    expect(
      new AddWarehouseParams({
        translations: new TranslationParams({ title: { en: 'Warehouse', ar: 'مستودع' } }),
      }).toMap(),
    ).toEqual({
      translations: {
        title: { en: 'Warehouse', ar: 'مستودع' },
      },
    });
  });
});
