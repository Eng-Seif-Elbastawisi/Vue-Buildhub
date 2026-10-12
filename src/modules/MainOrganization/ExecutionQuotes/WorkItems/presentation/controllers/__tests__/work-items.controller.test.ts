import { beforeEach, expect, it } from 'vitest';
import type { AxiosResponse } from 'axios';
import {
  DataSuccess,
  DataLoading,
  DataFailed,
  DataCancelled,
} from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import WorkItemsController from '../work-items.controller';
import ScheduleGroupModel from '../../../../Schedule/core/models/schedule.group.model';
import ProjectTimelineStageModel from '../../../../Schedule/core/models/project.timeline.stage.model';
import StoreTaskParams from '../../../core/params/store.task.params';
import IndexEmployeeParams from '@/modules/MainOrganization/employee/core/params/index.employee.params';
import { mockNetwork, response } from '../../../../SiteTeam/__tests__/network';
const controller = WorkItemsController.getInstance();
let post: ReturnType<typeof mockNetwork>;
function deferred() {
  let resolve!: (record: AxiosResponse<unknown>) => void;
  const promise = new Promise<AxiosResponse<unknown>>((accept) => {
    resolve = accept;
  });
  return { promise, resolve };
}
beforeEach(() => {
  post = mockNetwork();
  controller.activate(140);
  controller.stagesState.value = new DataSuccess({
    data: [
      new ScheduleGroupModel({
        id: 2,
        title: 'Group',
        duration: 1,
        durationType: 4,
        stages: [
          new ProjectTimelineStageModel({
            id: 18,
            quoteStageId: 999,
            title: 'Electrical',
            children: [],
          }),
        ],
      }),
    ],
  });
});
it('uses actual timeline stage ID and rejects QuoteStage ID', async () => {
  post.mockResolvedValue(response({ status: true, data: [] }));
  expect(controller.stages.value[0]?.id).toBe(18);
  expect(await controller.saveTask(new StoreTaskParams(999, 'Task'))).toBeInstanceOf(DataFailed);
  expect(post).not.toHaveBeenCalled();
  expect(await controller.saveTask(new StoreTaskParams(18, 'Task'))).toBeInstanceOf(DataSuccess);
  expect(post.mock.calls[0]?.[0].data).toMatchObject({ project_timeline_stage_id: 18 });
});
it('isolates late Quote A reads from Quote B', async () => {
  const pending = deferred();
  post.mockReturnValueOnce(pending.promise).mockResolvedValue(response({ status: true, data: [] }));
  const a = controller.loadTasks();
  controller.activate(141);
  await controller.loadTasks();
  pending.resolve(
    response({
      status: true,
      data: [
        {
          id: 1,
          project_timeline_stage_id: 18,
          employee: { id: 1, name: 'A', type: 1 },
          title: 'A',
          assigned_employee: null,
          end_date: null,
          created_at: null,
        },
      ],
    }),
  );
  await a;
  expect(controller.tasksState.value.data).toEqual([]);
  expect(post.mock.calls[1]?.[0].data).toEqual({ quote_id: 141 });
});
it('independent states and latest-request isolation', async () => {
  const pending = deferred();
  post.mockReturnValueOnce(pending.promise).mockResolvedValue(response({ status: true, data: [] }));
  const first = controller.loadTasks();
  await controller.loadReports();
  expect(controller.tasksState.value).toBeInstanceOf(DataLoading);
  expect(controller.reportsState.value).toBeInstanceOf(DataSuccess);
  await controller.loadTasks();
  pending.resolve(
    response({
      status: true,
      data: [
        {
          id: 1,
          project_timeline_stage_id: 18,
          employee: { id: 1, name: 'Old', type: 1 },
          title: 'Old',
          assigned_employee: null,
          end_date: null,
          created_at: null,
        },
      ],
    }),
  );
  await first;
  expect(controller.tasksState.value.data).toEqual([]);
});
it('blocks duplicate mutations and refreshes only affected collection', async () => {
  const pending = deferred();
  post.mockReturnValueOnce(pending.promise).mockResolvedValue(response({ status: true, data: [] }));
  const first = controller.saveTask(new StoreTaskParams(18, 'Task'));
  expect(await controller.saveTask(new StoreTaskParams(18, 'Task'))).toBeInstanceOf(DataCancelled);
  pending.resolve(response({ status: true }));
  await first;
  expect(post.mock.calls.map((call) => call[0].url?.split('/').pop())).toEqual([
    'store_project_timeline_stage_task',
    'fetch_project_timeline_stage_tasks',
  ]);
});
it('failed Store does not refresh or invent a row', async () => {
  post.mockResolvedValue(response({ status: false, message: 'Rejected' }));
  expect(await controller.saveTask(new StoreTaskParams(18, 'Task'))).toBeInstanceOf(DataFailed);
  expect(post).toHaveBeenCalledTimes(1);
  expect(controller.tasksState.value.data).toBeNull();
});
it('late Store after owner switch cannot trigger refresh or close a new form', async () => {
  const pending = deferred();
  post.mockReturnValueOnce(pending.promise);
  const save = controller.saveTask(new StoreTaskParams(18, 'Task'));
  controller.activate(141);
  pending.resolve(response({ status: true }));
  expect(await save).toBeInstanceOf(DataCancelled);
  expect(post).toHaveBeenCalledTimes(1);
});
it('Schedule lookup uses existing fetch_project_timelines and actual stage IDs', async () => {
  post.mockResolvedValue(
    response({
      status: true,
      data: {
        basicData: { count_timeline: 1 },
        data: [
          {
            id: 2,
            title: 'Group',
            duration: 1,
            duration_type: 4,
            stages: [
              { id: 18, quote_stage_id: 999, stage: { id: 77, title: 'Electrical' }, children: [] },
            ],
          },
        ],
      },
    }),
  );
  await controller.loadStages();
  expect(post.mock.calls[0]?.[0]).toMatchObject({
    url: expect.stringContaining('fetch_project_timelines'),
    data: { quote_id: 140 },
  });
  expect(controller.stages.value[0]?.id).toBe(18);
});
it('keeps submission disabled while authoritative refresh is pending', async () => {
  const pending = deferred();
  post.mockResolvedValueOnce(response({ status: true })).mockReturnValueOnce(pending.promise);
  const save = controller.saveTask(new StoreTaskParams(18, 'Task'));
  for (let turn = 0; turn < 20; turn++) await Promise.resolve();
  expect(controller.tasksSaveState.value).toBeInstanceOf(DataLoading);
  expect(await controller.saveTask(new StoreTaskParams(18, 'Task'))).toBeInstanceOf(DataCancelled);
  pending.resolve(response({ status: true, data: [] }));
  await save;
  expect(post).toHaveBeenCalledTimes(2);
});
it('employee lookup sends supported search/page and ignores stale owner response', async () => {
  post.mockResolvedValue(
    response({
      status: true,
      data: [{ id: 7, name: 'Engineer', type: 2 }],
      meta: { current_page: 2, last_page: 3, total: 25, per_page: 10 },
    }),
  );
  const options = await controller.loadEmployees(new IndexEmployeeParams('Eng', 2, 10, 1));
  expect(options.map((option) => option.id)).toEqual([7]);
  expect(post.mock.calls[0]?.[0].data).toMatchObject({ word: 'Eng', page: 2 });
  const pending = deferred();
  post.mockReturnValueOnce(pending.promise);
  const old = controller.loadEmployees(new IndexEmployeeParams());
  controller.activate(141);
  pending.resolve(response({ status: true, data: [{ id: 7, name: 'Old' }] }));
  expect(await old).toEqual([]);
  expect(controller.employeesState.value.data).toBeNull();
});
