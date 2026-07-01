import { beforeEach, describe, expect, it } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { useUserStore } from '@/stores/user';
import { StageEndpoints } from '../stage.api.endpoints';

describe('StageEndpoints', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('uses mainportal prefix for type 1 user', () => {
    const userStore = useUserStore();
    userStore.user = { type: 1 } as any;
    const endpoints = new StageEndpoints();

    expect(endpoints.index).toContain('mainportal/fetch_stages');
    expect(endpoints.show).toContain('mainportal/show_stage');
    expect(endpoints.store).toContain('mainportal/store_stage');
    expect(endpoints.update).toContain('mainportal/update_stage');
    expect(endpoints.delete).toContain('mainportal/delete_stage');
  });

  it('uses organization prefix for other users', () => {
    const userStore = useUserStore();
    userStore.user = { type: 2 } as any;
    const endpoints = new StageEndpoints();

    expect(endpoints.index).toContain('organization/fetch_stages');
    expect(endpoints.show).toContain('organization/show_stage');
    expect(endpoints.store).toContain('organization/store_stage');
    expect(endpoints.update).toContain('organization/update_stage');
    expect(endpoints.delete).toContain('organization/delete_stage');
  });
});
