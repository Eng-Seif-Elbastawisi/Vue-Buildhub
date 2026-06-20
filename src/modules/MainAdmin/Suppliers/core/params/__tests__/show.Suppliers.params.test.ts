import { describe, expect, it } from 'vitest';
import ShowSuppliersParams from '../show.Suppliers.params';

describe('ShowSuppliersParams', () => {
  it('maps supplier id without allLocales', () => {
    expect(new ShowSuppliersParams({ suppliers_id: 8, allLocales: true }).toMap()).toEqual({
      suppliers_id: 8,
    });
    expect(
      new ShowSuppliersParams({ suppliers_id: null as unknown as number }).validate().isValid,
    ).toBe(false);
  });
});
