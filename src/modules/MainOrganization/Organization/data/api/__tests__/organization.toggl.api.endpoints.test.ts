import { beforeEach, describe, expect, it } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { useUserStore } from '@/stores/user';
import UserModel from '@/modules/auth/core/models/user.model';
import { OrganizationEndpoints } from '../organization.toggl.api.endpoints';

describe('OrganizationEndpoints', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('uses mainportal prefix for type 1 users', () => {
    const userStore = useUserStore();
    userStore.user = new UserModel({ email: 'admin@example.com', name: 'Admin', type: 1 });
    const endpoints = new OrganizationEndpoints();

    expect(endpoints.show).toContain('mainportal/show_fetch_from');
    expect(endpoints.store).toContain('mainportal/toggle_fetch_from');
  });

  it('uses organization prefix for other users', () => {
    const userStore = useUserStore();
    userStore.user = new UserModel({
      email: 'organization@example.com',
      name: 'Organization',
      type: 2,
    });
    const endpoints = new OrganizationEndpoints();

    expect(endpoints.show).toContain('organization/show_fetch_from');
    expect(endpoints.store).toContain('organization/toggle_fetch_from');
  });
});
