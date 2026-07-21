import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it } from 'vitest';
import { PricePercentageApiEndpoints } from '../price.percentage.api.endpoints';

describe('PricePercentageApiEndpoints', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('defines the show and update percentage endpoints', () => {
    const endpoints = new PricePercentageApiEndpoints();

    expect(endpoints.show).toContain('organization/show_percentages');
    expect(endpoints.update).toContain('organization/update_percentages');
  });
});
