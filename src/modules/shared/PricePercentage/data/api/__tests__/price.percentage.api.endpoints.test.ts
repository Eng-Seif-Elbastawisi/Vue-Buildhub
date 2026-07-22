import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it } from 'vitest';
import { PricePercentageApiEndpoints } from '../price.percentage.api.endpoints';

describe('PricePercentageApiEndpoints', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('defines the set invoice offer endpoint', () => {
    const endpoints = new PricePercentageApiEndpoints();

    expect(endpoints.update).toContain('organization/set_invoice_offer');
  });
});
