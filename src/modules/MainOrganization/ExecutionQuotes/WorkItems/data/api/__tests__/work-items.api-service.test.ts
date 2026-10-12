import { beforeEach, expect, it } from 'vitest';
import WorkItemsApiService from '../work-items.api-service';
import FetchWorkItemsParams from '../../../core/params/fetch.work-items.params';
import StoreTaskParams from '../../../core/params/store.task.params';
import StoreReportParams from '../../../core/params/store.report.params';
import StoreActivityParams from '../../../core/params/store.activity.params';
import { mockNetwork } from '../../../../SiteTeam/__tests__/network';
let post: ReturnType<typeof mockNetwork>;
beforeEach(() => {
  post = mockNetwork();
});
const api = WorkItemsApiService.getInstance();
it.each([
  [
    'fetch_project_timeline_stage_tasks',
    () => api.fetchTasks(new FetchWorkItemsParams(140)),
    { quote_id: 140 },
  ],
  [
    'fetch_project_timeline_stage_reports',
    () => api.fetchReports(new FetchWorkItemsParams(140)),
    { quote_id: 140 },
  ],
  [
    'fetch_project_timeline_stage_meetings',
    () => api.fetchActivities(new FetchWorkItemsParams(140)),
    { quote_id: 140 },
  ],
  [
    'store_project_timeline_stage_task',
    () => api.storeTask(new StoreTaskParams(18, 'Task', 7, '2026-10-20')),
    { project_timeline_stage_id: 18, title: 'Task', employee_id: 7, end_date: '2026-10-20' },
  ],
  [
    'store_project_timeline_stage_report',
    () => api.storeReport(new StoreReportParams(18, '2026-10-12', null, 1)),
    { project_timeline_stage_id: 18, date: '2026-10-12', notes: null, site_safety_status: 1 },
  ],
  [
    'store_project_timeline_stage_meeting',
    () =>
      api.storeActivity(
        new StoreActivityParams({
          projectTimelineStageId: 18,
          type: 1,
          title: 'Meeting',
          date: '2026-10-15',
          description: null,
          employeeId: null,
        }),
      ),
    { project_timeline_stage_id: 18, type: 1, title: 'Meeting', date: '2026-10-15' },
  ],
] as const)('sends JSON to %s, authenticated without retry', async (endpoint, request, body) => {
  await request();
  expect(post.mock.calls[0]?.[0]).toMatchObject({
    url: expect.stringContaining(endpoint),
    data: body,
    isAuth: true,
  });
  expect(post.mock.calls[0]?.[1]?.enableRetry).toBe(false);
});
it('blocks invalid input before network', async () => {
  await expect(async () => api.storeTask(new StoreTaskParams(0, 'Task'))).rejects.toThrow();
  expect(post).not.toHaveBeenCalled();
});
