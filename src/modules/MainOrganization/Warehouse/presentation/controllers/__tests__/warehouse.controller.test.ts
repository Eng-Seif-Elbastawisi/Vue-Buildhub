import { describe, expect, it } from 'vitest';
import WarehouseController from '../warehouse.controller';

describe('WarehouseController', () => {
  it('returns the same singleton', () => {
    expect(WarehouseController.getInstance()).toBe(WarehouseController.getInstance());
  });
});
