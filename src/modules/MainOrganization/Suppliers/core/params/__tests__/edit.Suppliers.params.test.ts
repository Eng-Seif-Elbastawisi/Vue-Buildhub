import { describe, expect, it } from 'vitest';
import EditSuppliersParams from '../edit.Suppliers.params';

describe('EditSuppliersParams', () => {
  it('maps supplier update payload', () => {
    expect(
      new EditSuppliersParams({
        suppliers_id: 4,
        name: 'Build',
        phone: '010',
      }).toMap(),
    ).toEqual({
      supplier_id: 4,
      name: 'Build',
      phone: '010',
    });
  });
});
