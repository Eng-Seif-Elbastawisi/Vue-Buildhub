import { describe, expect, it } from 'vitest';
import DeleteSuppliersParams from '../delete.Suppliers.params';

describe('DeleteSuppliersParams', () => {
  it('maps and validates supplier id', () => {
    expect(new DeleteSuppliersParams({ suppliers_id: 3 }).toMap()).toEqual({ suppliers_id: 3 });
    expect(
      new DeleteSuppliersParams({ suppliers_id: null as unknown as number }).validate().isValid,
    ).toBe(false);
  });
});
