import { describe, expect, it } from 'vitest';
import ProjectPricingApiService from '../project.pricing.api-service';

describe('ProjectPricingApiService', () => {
  it('returns the same singleton instance', () => {
    expect(ProjectPricingApiService.getInstance()).toBe(ProjectPricingApiService.getInstance());
  });

  it('maps base API actions to project pricing endpoints', () => {
    const service = ProjectPricingApiService.getInstance() as unknown as {
      endpoints: Record<string, string>;
    };

    expect(service.endpoints.index).toContain('mainportal/fetch_project_pricings');
    expect(service.endpoints.create).toContain('mainportal/store_project_pricing');
    expect(service.endpoints.update).toContain('mainportal/update_project_pricing');
    expect(service.endpoints.delete).toContain('mainportal/delete_project_pricing');
  });
});
