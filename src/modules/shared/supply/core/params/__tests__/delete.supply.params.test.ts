import { describe, expect, it } from 'vitest';
import DeleteSupplyParams from '../delete.supply.params';

describe('DeleteSupplyParams', () => {
  it('maps and validates supply id', () => {
    expect(new DeleteSupplyParams({ supply_id: 5 }).toMap()).toEqual({ supply_id: 5 });
    expect(
      new DeleteSupplyParams({ supply_id: null as unknown as number }).validate().isValid,
    ).toBe(false);
  });
});
