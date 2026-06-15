import { describe, expect, it } from 'vitest';
import AddSuppliersParams from '../add.Suppliers.params';
import DeleteSuppliersParams from '../delete.Suppliers.params';
import EditSuppliersParams from '../edit.Suppliers.params';
import IndexSuppliersParams from '../index.Suppliers.params';
import ShowSuppliersParams from '../show.Suppliers.params';

describe('supplier params', () => {
  it('maps add and edit payloads', () => {
    const data = { name: 'Build Supply', Specialization: 'Concrete', phone: '01000000000', materials: 'Cement' };
    expect(new AddSuppliersParams(data).toMap()).toEqual(data);
    expect(new EditSuppliersParams({ suppliers_id: 8, ...data }).toMap()).toEqual({ suppliers_id: 8, ...data });
  });

  it('maps list filters and omits empty optional filters', () => {
    expect(new IndexSuppliersParams('build', 3, 15, 1, '2026-06-15', 4).toMap()).toEqual({
      word: 'build', with_pagination: 1, page: 3, per_page: 15, date_remove: '2026-06-15', supplier_type_id: 4,
    });
    expect(new IndexSuppliersParams().toMap()).toEqual({ with_pagination: 1, page: 1, per_page: 10 });
  });

  it('maps identifiers without leaking allLocales', () => {
    expect(new ShowSuppliersParams({ suppliers_id: 2, allLocales: true }).toMap()).toEqual({ suppliers_id: 2 });
    expect(new DeleteSuppliersParams({ suppliers_id: 2 }).toMap()).toEqual({ suppliers_id: 2 });
    expect(new ShowSuppliersParams({ suppliers_id: null as unknown as number }).validate().isValid).toBe(false);
  });
});
