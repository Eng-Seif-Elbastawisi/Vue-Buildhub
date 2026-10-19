import { expect, it } from 'vitest';
import { executionQuoteRoutes } from '@/router/routes/modules/execution_quotes';
import {
  procurementPath,
  purchaseOrderCreatePath,
  purchaseRequestCreatePath,
  supplierPricesPath,
} from '../procurement.routes';
it.each(['/organization', '/mainportal'])('preserves owner and workspace prefix %s', (prefix) =>
  expect(procurementPath(`${prefix}/execution-quotes/show/140`, 140)).toBe(
    `${prefix}/execution-quotes/show/140/procurement`,
  ),
);
it.each(['/organization', '/mainportal'])('builds the purchase order page under %s', (prefix) =>
  expect(purchaseOrderCreatePath(`${prefix}/execution-quotes/show/140/procurement`, 140)).toBe(
    `${prefix}/execution-quotes/show/140/procurement/purchase-orders/add`,
  ),
);
it('registers the create page as a direct quote route', () => {
  const route = executionQuoteRoutes.find((entry) => entry.name === 'Quote Purchase Order Add');
  expect(route?.path).toBe('execution-quotes/show/:id(\\d+)/procurement/purchase-orders/add');
  expect(route?.component).toBeDefined();
});
it.each(['/organization', '/mainportal'])('builds the request page under %s', (prefix) =>
  expect(purchaseRequestCreatePath(`${prefix}/execution-quotes/show/140/procurement`, 140)).toBe(
    `${prefix}/execution-quotes/show/140/procurement/purchase-requests/add`,
  ),
);
it('registers the request create page as a direct quote route', () => {
  const route = executionQuoteRoutes.find((entry) => entry.name === 'Quote Purchase Request Add');
  expect(route?.path).toBe('execution-quotes/show/:id(\\d+)/procurement/purchase-requests/add');
  expect(route?.component).toBeDefined();
});
it.each(['/organization', '/mainportal'])('builds the Supplier Prices page under %s', (prefix) =>
  expect(supplierPricesPath(`${prefix}/execution-quotes/show/140/procurement`, 140, 7)).toBe(
    `${prefix}/execution-quotes/show/140/procurement/purchase-requests/7/supplier-prices`,
  ),
);
it('registers the Supplier Prices management page as a direct quote route', () => {
  const route = executionQuoteRoutes.find((entry) => entry.name === 'Quote Supplier Prices');
  expect(route?.path).toBe(
    'execution-quotes/show/:id(\\d+)/procurement/purchase-requests/:purchaseRequestId(\\d+)/supplier-prices',
  );
  expect(route?.component).toBeDefined();
});
