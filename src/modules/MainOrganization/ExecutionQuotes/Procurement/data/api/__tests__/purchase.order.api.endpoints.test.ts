import { expect, it } from 'vitest';
import { mockNetwork } from '../../../../SiteTeam/__tests__/network';
import { PurchaseOrderEndpoints } from '../purchase.order.api.endpoints';
it('exposes only Store and Fetch order routes', () => {
  mockNetwork();
  const endpoints = new PurchaseOrderEndpoints();
  expect(endpoints.show).toContain('/fetch_purchase_order');
  expect(endpoints.create).toContain('/store_purchase_order');
});
