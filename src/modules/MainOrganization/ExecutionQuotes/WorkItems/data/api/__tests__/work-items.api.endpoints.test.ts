import { beforeEach, expect, it } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { BaseEndpoints } from '@/base/Data/Endpoints/BaseEndpoints';
import { baseUrl } from '@/base/Core/NetworkStructure/baseUrl';
import { useUserStore } from '@/stores/user';
import UserModel from '@/modules/auth/core/models/user.model';
import { WorkItemsEndpoints } from '../work-items.api.endpoints';

beforeEach(() => setActivePinia(createPinia()));
it('resolves all endpoints for the active workspace, including after a workspace switch', () => {
  const endpoints = new WorkItemsEndpoints();
  expect(endpoints).toBeInstanceOf(BaseEndpoints);
  const store = useUserStore();
  for (const [type, prefix] of [
    [2, 'organization/'],
    [1, 'mainportal/'],
  ] as const) {
    store.setUser(
      new UserModel({
        id: 1,
        name: 'Test user',
        email: 'test@example.com',
        WebSocketToken: '',
        type,
      }),
    );
    expect([
      endpoints.fetchTasks,
      endpoints.storeTask,
      endpoints.fetchReports,
      endpoints.storeReport,
      endpoints.fetchActivities,
      endpoints.storeActivity,
    ]).toEqual(
      [
        'fetch_project_timeline_stage_tasks',
        'store_project_timeline_stage_task',
        'fetch_project_timeline_stage_reports',
        'store_project_timeline_stage_report',
        'fetch_project_timeline_stage_meetings',
        'store_project_timeline_stage_meeting',
      ].map((path) => `${baseUrl}${prefix}${path}`),
    );
  }
});
