import { beforeEach, describe, expect, it } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { useUserStore } from '@/stores/user';
import { OrganizationEndpoints } from '../organization.api.endpoints';

describe('OrganizationEndpoints', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('uses mainportal prefix for type 1 user', () => {
    const userStore = useUserStore();
    userStore.user = { type: 1 } as any;
    const endpoints = new OrganizationEndpoints();

    expect(endpoints.index).toContain('mainportal/fetch_organizations');
    expect(endpoints.show).toContain('mainportal/show_organization');
    expect(endpoints.store).toContain('mainportal/store_organization');
    expect(endpoints.update).toContain('mainportal/update_organization');
    expect(endpoints.delete).toContain('mainportal/delete_organization');
  });

  it('uses organization prefix for other users', () => {
    const userStore = useUserStore();
    userStore.user = { type: 2 } as any;
    const endpoints = new OrganizationEndpoints();

    expect(endpoints.index).toContain('organization/fetch_organizations');
    expect(endpoints.show).toContain('organization/show_organization');
    expect(endpoints.store).toContain('organization/store_organization');
    expect(endpoints.update).toContain('organization/update_organization');
    expect(endpoints.delete).toContain('organization/delete_organization');
  });
});
