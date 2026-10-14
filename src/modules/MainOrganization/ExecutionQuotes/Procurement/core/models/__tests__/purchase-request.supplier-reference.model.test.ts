import { expect, it } from 'vitest';
import PurchaseRequestSupplierReferenceModel from '../purchase-request.supplier-reference.model';
it('maps actual supplier names and preserves absent names without requiring unrelated master fields', () => {
  expect(PurchaseRequestSupplierReferenceModel.fromJson({ id: 3, name: 'ABC Supplier' })).toEqual(
    new PurchaseRequestSupplierReferenceModel(3, 'ABC Supplier'),
  );
  expect(PurchaseRequestSupplierReferenceModel.fromJson({ id: 3 }).name).toBeNull();
});
it.each([null, [], { id: 0, name: 'A' }, { id: 3, name: 5 }])(
  'rejects malformed supplier relation %j',
  (value) => {
    expect(() => PurchaseRequestSupplierReferenceModel.fromJson(value)).toThrow(
      'procurement.offers.invalid_response',
    );
  },
);
