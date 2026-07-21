import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it } from 'vitest';
import PricePercentageApiService from '../price.percentage.api-service';

describe('PricePercentageApiService', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('maps show and update actions to the percentage endpoints', () => {
    const service = PricePercentageApiService.getInstance() as unknown as {
      endpoints: Record<string, string>;
    };

    expect(service.endpoints.show).toContain('show_percentages');
    expect(service.endpoints.update).toContain('update_percentages');
  });
});
