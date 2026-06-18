import { describe, expect, it } from 'vitest';
import StageApiService from '../stage.api-service';

describe('StageApiService', () => {
  it('returns the same singleton instance', () => {
    expect(StageApiService.getInstance()).toBe(StageApiService.getInstance());
  });

  it('maps base API actions to stage endpoints', () => {
    const service = StageApiService.getInstance() as unknown as {
      endpoints: Record<string, string>;
    };

    expect(service.endpoints.index).toContain('dashboard/index_stages');
    expect(service.endpoints.create).toContain('dashboard/store_stage');
    expect(service.endpoints.update).toContain('dashboard/update_stage');
    expect(service.endpoints.delete).toContain('dashboard/delete_stage');
  });
});
