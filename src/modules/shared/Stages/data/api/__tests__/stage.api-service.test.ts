import { beforeEach, describe, expect, it } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { useUserStore } from '@/stores/user';
import StageApiService from '../stage.api-service';

describe('StageApiService', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    useUserStore().user = { type: 1 } as any;
  });

  it('returns the same singleton instance', () => {
    expect(StageApiService.getInstance()).toBe(StageApiService.getInstance());
  });

  it('maps base API actions to stage endpoints', () => {
    const service = StageApiService.getInstance() as unknown as {
      endpoints: Record<string, string>;
    };

    expect(service.endpoints.index).toContain('mainportal/fetch_stages');
    expect(service.endpoints.create).toContain('mainportal/store_stage');
    expect(service.endpoints.update).toContain('mainportal/update_stage');
    expect(service.endpoints.delete).toContain('mainportal/delete_stage');
  });
});
