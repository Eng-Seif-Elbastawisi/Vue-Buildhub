import { describe, expect, it } from 'vitest';
import TranslationParams from '@/base/Core/Params/translationParams';
import EditWarehouseParams from '../edit.warehouse.params';

describe('EditWarehouseParams', () => {
  it('maps update data', () => {
    expect(
      new EditWarehouseParams({
        warehouseId: 2,
        translations: new TranslationParams({ title: { en: 'Warehouse', ar: 'مستودع' } }),
      }).toMap(),
    ).toEqual({
      warehouse_id: 2,
      translations: {
        title: { en: 'Warehouse', ar: 'مستودع' },
      },
    });
  });
});
