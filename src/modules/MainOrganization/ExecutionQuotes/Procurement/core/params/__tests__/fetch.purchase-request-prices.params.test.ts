import { expect, it } from 'vitest';
import FetchPurchaseRequestPricesParams from '../fetch.purchase-request-prices.params';
it('sends only the Purchase Request ID and validates it', () => {
  expect(new FetchPurchaseRequestPricesParams(1).toMap()).toEqual({ purchase_request_id: 1 });
  expect(new FetchPurchaseRequestPricesParams(1).validate().isValid).toBe(true);
  expect(new FetchPurchaseRequestPricesParams(0).validate().isValid).toBe(false);
});
