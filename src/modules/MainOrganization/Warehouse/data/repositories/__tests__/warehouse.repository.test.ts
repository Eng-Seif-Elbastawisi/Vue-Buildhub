import { describe, expect, it } from 'vitest';
import WarehouseRepository from '../warehouse.repository';

describe('WarehouseRepository', () => {
  it('returns the same singleton', () => {
    expect(WarehouseRepository.getInstance()).toBe(WarehouseRepository.getInstance());
  });
});
