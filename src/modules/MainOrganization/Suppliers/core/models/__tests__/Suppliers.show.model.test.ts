import { describe, expect, it } from 'vitest';
import SuppliersShowModel from '../Suppliers.show.model';

describe('SuppliersShowModel', () => {
  it('maps supplier show JSON and freezes the instance', () => {
    const model = SuppliersShowModel.fromJson({
      id: 2,
      phone: '01111111111',
      materials: 'Steel',
      Supplier: 'Acme',
      spacification: 'Metal',
    });

    expect(model).toMatchObject({
      id: 2,
      phone: '01111111111',
      materials: 'Steel',
      Supplier: 'Acme',
      spacification: 'Metal',
    });
    expect(Object.isFrozen(model)).toBe(true);
  });

  it('maps localized data from translation arrays', () => {
    expect(
      SuppliersShowModel.getLocalizedData(
        { id: 5, names: [{ locale: 'en', title: 'Supplier EN' }] },
        'en',
      ),
    ).toEqual({ id: 5, title: 'Supplier EN' });
  });
});
