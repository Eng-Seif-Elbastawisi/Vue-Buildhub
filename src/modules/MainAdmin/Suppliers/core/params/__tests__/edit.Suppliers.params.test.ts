import { describe, expect, it } from 'vitest';
import EditSuppliersParams from '../edit.Suppliers.params';

describe('EditSuppliersParams', () => {
  it('maps supplier update payload', () => {
    expect(
      new EditSuppliersParams({
        suppliers_id: 4,
        name: 'Build',
        Specialization: 'Concrete',
        phone: '010',
        materials: 'Cement',
      }).toMap(),
    ).toEqual({
      suppliers_id: 4,
      name: 'Build',
      Specialization: 'Concrete',
      phone: '010',
      materials: 'Cement',
    });
  });
});
