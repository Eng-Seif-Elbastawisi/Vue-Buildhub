import { expect, it } from 'vitest';
import PurchaseRequestPriceModel from '../purchase-request.price.model';
import PurchaseRequestSupplierReferenceModel from '../purchase-request.supplier-reference.model';
import { priceRecord } from '../../../__tests__/price-fixtures';
it('keeps record ID separate from supplier ID and preserves decimal strings/date/unit', () => {
  const offer = PurchaseRequestPriceModel.fromJson(priceRecord());
  expect(offer).toMatchObject({
    id: 15,
    purchaseRequestId: 1,
    price: '1500.00',
    duration: 2,
    durationType: 2,
    createdAt: '2026-10-13 13:25:49',
  });
  expect(offer.supplier).toBeInstanceOf(PurchaseRequestSupplierReferenceModel);
  expect(offer.supplier?.id).toBe(3);
});
it('preserves missing nullable data without fabricated prices or names', () => {
  const offer = PurchaseRequestPriceModel.fromJson({
    id: 15,
    purchase_request_id: 1,
    supplier: null,
  });
  expect([
    offer.supplier,
    offer.price,
    offer.duration,
    offer.durationType,
    offer.createdAt,
  ]).toEqual([null, null, null, null, null]);
});
it.each([
  { price: 1500 },
  { duration: 2.5 },
  { duration_type: 9 },
  { purchase_request_id: 0 },
  { created_at: 123 },
])('rejects malformed record %j', (overrides) => {
  expect(() => PurchaseRequestPriceModel.fromJson({ ...priceRecord(), ...overrides })).toThrow(
    'procurement.offers.invalid_response',
  );
});
