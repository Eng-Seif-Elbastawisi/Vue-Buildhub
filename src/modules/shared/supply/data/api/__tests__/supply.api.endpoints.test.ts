import { beforeEach, describe, expect, it } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { useUserStore } from '@/stores/user';
import { SupplyApiEndpoints } from '../supply.api.endpoints';

describe('SupplyApiEndpoints', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('uses mainportal prefix for type 1 user', () => {
    const userStore = useUserStore();
    userStore.user = { type: 1 } as any;
    const endpoints = new SupplyApiEndpoints();

    expect(endpoints.index).toContain('mainportal/fetch_materials');
    expect(endpoints.store).toContain('mainportal/store_material');
    expect(endpoints.delete).toContain('mainportal/delete_material');
  });

  it('uses organization prefix for other users', () => {
    const userStore = useUserStore();
    userStore.user = { type: 2 } as any;
    const endpoints = new SupplyApiEndpoints();

    expect(endpoints.index).toContain('organization/fetch_materials');
    expect(endpoints.store).toContain('organization/store_material');
    expect(endpoints.delete).toContain('organization/delete_material');
  });
});
