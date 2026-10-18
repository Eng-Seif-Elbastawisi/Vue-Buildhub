import { createPinia, setActivePinia } from 'pinia';
import { expect, it } from 'vitest';
import { MaterialDisbursementEndpoints } from '../material-disbursement.api.endpoints';

it('uses the established organization prefix and the three confirmed actions', () => {
  setActivePinia(createPinia());
  const endpoints = new MaterialDisbursementEndpoints();
  expect(endpoints.index).toContain('organization/fetch_purchase_request_disbursement_stock');
  expect(endpoints.show).toContain('organization/fetch_purchase_request_disbursements');
  expect(endpoints.create).toContain('organization/store_purchase_request_disbursement');
});
