import { describe, expect, it } from 'vitest';
import WarehouseShowModel from '../warehouse.show.model';

describe('WarehouseShowModel', () => {
  it('maps warehouse details', () => {
    expect(
      WarehouseShowModel.fromJson({
        id: 3,
        title: [{ locale: 'en', title: 'Central warehouse' }],
      }),
    ).toMatchObject({
      id: 3,
      title: 'Central warehouse',
    });
  });
});
