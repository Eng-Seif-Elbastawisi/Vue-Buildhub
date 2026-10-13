import { beforeEach, expect, it } from 'vitest';
import { mockNetwork } from '../../../../SiteTeam/__tests__/network';
import { PurchaseRequestEndpoints } from '../purchase-request.api.endpoints';
beforeEach(() => {
  mockNetwork();
});
it('exposes only the confirmed fetch and store endpoints through the existing API prefix', () => {
  const endpoints = new PurchaseRequestEndpoints();
  expect(endpoints.index).toMatch(/organization\/fetch_purchase_requests$/);
  expect(endpoints.create).toMatch(/organization\/store_purchase_request$/);
  expect(endpoints).not.toHaveProperty('show');
  expect(endpoints).not.toHaveProperty('update');
  expect(endpoints).not.toHaveProperty('delete');
});
