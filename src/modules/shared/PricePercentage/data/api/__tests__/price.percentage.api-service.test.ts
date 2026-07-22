import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it } from 'vitest';
import PricePercentageApiService from '../price.percentage.api-service';

describe('PricePercentageApiService', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('maps updates to the set invoice offer endpoint', () => {
    const service = PricePercentageApiService.getInstance() as unknown as {
      endpoints: Record<string, string>;
    };

    expect(service.endpoints).toEqual({
      update: expect.stringContaining('set_invoice_offer'),
    });
  });
});
