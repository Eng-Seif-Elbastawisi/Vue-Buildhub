import { describe, expect, it } from 'vitest';
import AddSuppliersParams from '../add.Suppliers.params';

describe('AddSuppliersParams', () => {
  it('maps supplier create payload', () => {
    const params = new AddSuppliersParams({
      name: 'Build',
      phone: '010',
    });

    expect(params.toMap()).toEqual({
      name: 'Build',
      phone: '010',
    });
    expect(params.validate().isValid).toBe(true);
  });
});
