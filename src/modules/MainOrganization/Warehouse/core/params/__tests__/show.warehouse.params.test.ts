import { describe, expect, it } from 'vitest';
import ShowWarehouseParams from '../show.warehouse.params';

describe('ShowWarehouseParams', () => {
  it('maps warehouse id', () => {
    expect(new ShowWarehouseParams({ warehouseId: 2 }).toMap()).toEqual({
      warehouse_id: 2,
    });
  });
});
