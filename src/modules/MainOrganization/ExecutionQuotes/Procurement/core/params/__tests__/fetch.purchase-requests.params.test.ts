import { expect, it } from 'vitest';
import FetchPurchaseRequestsParams from '../fetch.purchase-requests.params';
it('sends only the Quote owner and requires a valid ID', () => {
  expect(new FetchPurchaseRequestsParams(140).toMap()).toEqual({ quote_id: 140 });
  expect(new FetchPurchaseRequestsParams(0).validate().isValid).toBe(false);
});
