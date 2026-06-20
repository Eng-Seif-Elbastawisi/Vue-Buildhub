import { describe, expect, it } from 'vitest';
import SuppliersModel from '../Suppliers.model';

describe('SuppliersModel', () => {
  it('maps supplier list JSON and freezes the instance', () => {
    const model = SuppliersModel.fromJson({
      id: 1,
      Suppliers: 'Build Supply',
      Specialization: 'Concrete',
      phone: '01000000000',
      materials: 'Cement',
    });

    expect(model).toMatchObject({
      id: 1,
      Suppliers: 'Build Supply',
      Specialization: 'Concrete',
      phone: '01000000000',
      materials: 'Cement',
    });
    expect(Object.isFrozen(model)).toBe(true);
  });

  it('throws for empty JSON and exposes an example', () => {
    expect(() => SuppliersModel.fromJson(null)).toThrow('Cannot create SuppliersModel');
    expect(SuppliersModel.example).toBeInstanceOf(SuppliersModel);
  });
});
