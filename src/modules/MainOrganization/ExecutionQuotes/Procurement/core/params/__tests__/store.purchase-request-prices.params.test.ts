import { expect, it } from 'vitest';
import StorePurchaseRequestPricesParams from '../store.purchase-request-prices.params';
import PurchaseRequestSupplierPriceParams from '../purchase-request.supplier-price.params';
it('serializes complete supplier list through named nested params without owner or offer-record IDs', () => {
  const supplier = new PurchaseRequestSupplierPriceParams(3, 1500, 2, 2);
  const params = new StorePurchaseRequestPricesParams(1, [
    supplier,
    new PurchaseRequestSupplierPriceParams(4, 200.5, 5, 1),
  ]);
  expect(params.toMap()).toEqual({
    purchase_request_id: 1,
    suppliers: [
      { id: 3, price: 1500, duration: 2, duration_type: 2 },
      { id: 4, price: 200.5, duration: 5, duration_type: 1 },
    ],
  });
});
it('permits explicit empty sync but rejects duplicate supplier IDs and invalid nested fields', () => {
  const params = new StorePurchaseRequestPricesParams(1, []);
  expect(params.validate().isValid).toBe(true);
  expect(params.toMap()).toEqual({ purchase_request_id: 1, suppliers: [] });
  params.suppliers = [
    new PurchaseRequestSupplierPriceParams(3, 200, 2, 1),
    new PurchaseRequestSupplierPriceParams(3, NaN, 2, 1),
  ];
  expect(params.validate().errors.map((error) => error.field)).toEqual(
    expect.arrayContaining(['suppliers.1.supplierId', 'suppliers.1.price']),
  );
});
