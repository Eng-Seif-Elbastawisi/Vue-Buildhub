import { describe, expect, it } from 'vitest';
import AddSuppliersParams from '../add.Suppliers.params';

describe('AddSuppliersParams', () => {
  it('maps supplier create payload', () => {
    const params = new AddSuppliersParams({
      name: 'Build',
      Specialization: 'Concrete',
      phone: '010',
      materials: 'Cement',
    });
    expect(params.toMap()).toEqual({
      name: 'Build',
      Specialization: 'Concrete',
      phone: '010',
      materials: 'Cement',
    });
    expect(params.validate().isValid).toBe(true);
  });
});
