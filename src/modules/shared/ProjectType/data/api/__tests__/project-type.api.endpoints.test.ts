import { beforeEach, describe, expect, it } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { useUserStore } from '@/stores/user';
import { ProjectTypeApiEndpoints } from '../project-type.api.endpoints';

describe('ProjectTypeApiEndpoints', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('uses mainportal prefix for type 1 user', () => {
    const userStore = useUserStore();
    userStore.user = { type: 1 } as any;
    const endpoints = new ProjectTypeApiEndpoints();

    expect(endpoints.index).toContain('mainportal/fetch_project_types');
    expect(endpoints.store).toContain('mainportal/store_project_type');
    expect(endpoints.delete).toContain('mainportal/delete_project_type');
  });

  it('uses organization prefix for other users', () => {
    const userStore = useUserStore();
    userStore.user = { type: 2 } as any;
    const endpoints = new ProjectTypeApiEndpoints();

    expect(endpoints.index).toContain('organization/fetch_project_types');
    expect(endpoints.store).toContain('organization/store_project_type');
    expect(endpoints.delete).toContain('organization/delete_project_type');
  });
});
