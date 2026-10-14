import { expect, it } from 'vitest';
import { mockNetwork } from '../../../../SiteTeam/__tests__/network';
import { PurchaseRequestPricesEndpoints } from '../purchase-request-prices.api.endpoints';
it('uses the existing authenticated organization endpoint prefix', () => {
  mockNetwork();
  const endpoints = new PurchaseRequestPricesEndpoints();
  expect(endpoints.index).toContain('/organization/fetch_purchase_request_prices');
  expect(endpoints.create).toContain('/organization/store_purchase_request_prices');
});
