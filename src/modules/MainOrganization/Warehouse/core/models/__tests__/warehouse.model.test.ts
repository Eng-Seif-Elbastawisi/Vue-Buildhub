import { describe, expect, it } from 'vitest';
import WarehouseModel from '../warehouse.model';

describe('WarehouseModel', () => {
  it('maps snake-case API data', () => {
    expect(
      WarehouseModel.fromJson({
        id: 2,
        title: 'Warehouse',
        translations: [{ locale: 'en', title: 'Warehouse' }],
      }),
    ).toMatchObject({
      id: 2,
      title: 'Warehouse',
    });
  });
});
