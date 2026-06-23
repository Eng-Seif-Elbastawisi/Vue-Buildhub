import { beforeEach, describe, expect, it } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { useUserStore } from '@/stores/user';
import { LocationApiEndpoints } from '../location.api.endpoints';

describe('LocationApiEndpoints', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('uses mainportal prefix for type 1 user', () => {
    const userStore = useUserStore();
    userStore.user = { type: 1 } as any;
    const endpoints = new LocationApiEndpoints();

    expect(endpoints.index).toContain('mainportal/fetch_locations');
    expect(endpoints.store).toContain('mainportal/store_location');
    expect(endpoints.delete).toContain('mainportal/delete_location');
  });

  it('uses organization prefix for other users', () => {
    const userStore = useUserStore();
    userStore.user = { type: 2 } as any;
    const endpoints = new LocationApiEndpoints();

    expect(endpoints.index).toContain('organization/fetch_locations');
    expect(endpoints.store).toContain('organization/store_location');
    expect(endpoints.delete).toContain('organization/delete_location');
  });
});
