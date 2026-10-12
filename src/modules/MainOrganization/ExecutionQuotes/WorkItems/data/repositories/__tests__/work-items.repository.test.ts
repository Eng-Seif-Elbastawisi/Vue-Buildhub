import { beforeEach, expect, it } from 'vitest';
import {
  DataSuccess,
  DataFailed,
} from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import WorkItemsRepository from '../work-items.repository';
import FetchWorkItemsParams from '../../../core/params/fetch.work-items.params';
import StoreTaskParams from '../../../core/params/store.task.params';
import { mockNetwork, response } from '../../../../SiteTeam/__tests__/network';
let post: ReturnType<typeof mockNetwork>;
beforeEach(() => {
  post = mockNetwork();
});
const repo = WorkItemsRepository.getInstance();
it('accepts verified empty fetch collection', async () => {
  post.mockResolvedValue(response({ status: true, data: [] }));
  const records = await repo.fetchTasks(new FetchWorkItemsParams(140));
  expect(records).toBeInstanceOf(DataSuccess);
  expect(records.data).toEqual([]);
});
it.each([
  { status: true, data: {} },
  { status: true },
  { status: false, data: [] },
  { status: true, data: [{ id: 1 }] },
])('rejects malformed envelopes or rows', async (body) => {
  post.mockResolvedValue(response(body));
  expect(await repo.fetchTasks(new FetchWorkItemsParams(140))).toBeInstanceOf(DataFailed);
});
it.each([{}, { data: { id: 1 } }, { status: false, message: 'Rejected' }])(
  'never fabricates Store success from undocumented body',
  async (body) => {
    post.mockResolvedValue(response(body));
    expect(await repo.storeTask(new StoreTaskParams(18, 'Task'))).toBeInstanceOf(DataFailed);
  },
);
it('requires authoritative success before refreshing, no invented record', async () => {
  post.mockResolvedValue(response({ status: true, message: 'Saved' }));
  const saved = await repo.storeTask(new StoreTaskParams(18, 'Task'));
  expect(saved).toBeInstanceOf(DataSuccess);
  expect(saved.data).toBeNull();
});
it('retains one shared collection of all activity types', async () => {
  post.mockResolvedValue(
    response({
      status: true,
      data: [1, 2, 3, 4].map((type) => ({
        id: type,
        project_timeline_stage_id: 18,
        employee: { id: 1, name: 'Creator', type: 1 },
        title: 'Record',
        date: null,
        description: null,
        assigned_employee: null,
        type,
        created_at: null,
      })),
    }),
  );
  const activities = await repo.fetchActivities(new FetchWorkItemsParams(140));
  expect(activities.data?.map((record) => record.type)).toEqual([1, 2, 3, 4]);
  expect(post).toHaveBeenCalledTimes(1);
});
it('surfaces unauthorized/network failures', async () => {
  post.mockRejectedValue(new Error('Unauthorized'));
  expect(await repo.fetchReports(new FetchWorkItemsParams(140))).toBeInstanceOf(DataFailed);
});
