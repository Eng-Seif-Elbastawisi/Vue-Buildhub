import { beforeEach, describe, expect, it } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { useUserStore } from '@/stores/user';
import UserModel from '@/modules/auth/core/models/user.model';
import OrganizationApiService from '../organization.toggl.api-service';

describe('OrganizationApiService', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    useUserStore().user = new UserModel({ email: 'admin@example.com', name: 'Admin', type: 1 });
  });

  it('returns the same singleton instance', () => {
    expect(OrganizationApiService.getInstance()).toBe(OrganizationApiService.getInstance());
  });

  it('maps show and create actions to toggle endpoints', () => {
    const service = OrganizationApiService.getInstance() as unknown as {
      endpoints: Record<string, string>;
    };

    expect(service.endpoints.show).toContain('mainportal/show_fetch_from');
    expect(service.endpoints.create).toContain('mainportal/toggle_fetch_from');
  });
});
