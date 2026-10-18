import { expect, it } from 'vitest';
import PurchaseRequestDisbursementItemParams from '../purchase-request-disbursement-item.params';

it('serializes the original purchase request item ID with a positive two-decimal quantity', () => {
  const item = new PurchaseRequestDisbursementItemParams(9, 1.25);
  expect(item.validate().isValid).toBe(true);
  expect(item.toMap()).toEqual({ purchase_request_item_id: 9, quantity: 1.25 });
  expect(new PurchaseRequestDisbursementItemParams(9, 0).validate().isValid).toBe(false);
  expect(new PurchaseRequestDisbursementItemParams(9, 1.234).validate().isValid).toBe(false);
});
