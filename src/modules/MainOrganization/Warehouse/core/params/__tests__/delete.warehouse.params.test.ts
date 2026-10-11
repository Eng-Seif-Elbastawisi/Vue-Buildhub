import { describe, expect, it } from 'vitest';
import DeleteWarehouseParams from '../delete.warehouse.params';

describe('DeleteWarehouseParams', () => {
  it('maps warehouse id', () => {
    expect(new DeleteWarehouseParams({ warehouseId: 2 }).toMap()).toEqual({
      warehouse_id: 2,
    });
  });
});
