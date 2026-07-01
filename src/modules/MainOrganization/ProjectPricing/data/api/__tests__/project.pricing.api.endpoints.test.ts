import { describe, expect, it } from 'vitest';
import { ProjectPricingApiEndpoints } from '../project.pricing.api.endpoints';

describe('ProjectPricingApiEndpoints', () => {
  it('uses dashboard project pricing endpoints', () => {
    const endpoints = new ProjectPricingApiEndpoints();

    expect(endpoints.index).toContain('mainportal/fetch_project_pricings');
    expect(endpoints.show).toContain('mainportal/show_project_pricing');
    expect(endpoints.store).toContain('mainportal/store_project_pricing');
    expect(endpoints.update).toContain('mainportal/update_project_pricing');
    expect(endpoints.delete).toContain('mainportal/delete_project_pricing');
  });
});
