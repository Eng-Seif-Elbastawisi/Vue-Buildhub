import { startedOverview } from '../../../__tests__/timeline-fixtures';
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
import StoreShopDrawingQuoteParams from '../../../core/params/store.shop-drawing.params';
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
        workStatus: 1,
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
  post.mockImplementation(async (request) =>
    response(
      request.url.includes('fetch_project_timelines')
        ? startedOverview()
        : { status: true, data: [] },
    ),
  );
  expect(controller.stages.value[0]?.id).toBe(18);
  expect(await controller.saveTask(new StoreTaskParams(999, 'Task'))).toBeInstanceOf(DataFailed);
  expect(post).not.toHaveBeenCalled();
  expect(await controller.saveTask(new StoreTaskParams(18, 'Task'))).toBeInstanceOf(DataSuccess);
  expect(post.mock.calls.find((call) => call[0].url.includes('store_'))?.[0].data).toMatchObject({
    project_timeline_stage_id: 18,
  });
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
  post
    .mockResolvedValueOnce(response(startedOverview()))
    .mockReturnValueOnce(pending.promise)
    .mockResolvedValue(response({ status: true, data: [] }));
  const first = controller.saveTask(new StoreTaskParams(18, 'Task'));
  expect(await controller.saveTask(new StoreTaskParams(18, 'Task'))).toBeInstanceOf(DataCancelled);
  pending.resolve(response({ status: true }));
  await first;
  expect(post.mock.calls.map((call) => call[0].url?.split('/').pop())).toEqual([
    'fetch_project_timelines',
    'store_project_timeline_stage_task',
    'fetch_project_timeline_stage_tasks',
  ]);
});
it('failed Store does not refresh or invent a row', async () => {
  post.mockImplementation(async (request) =>
    response(
      request.url.includes('fetch_project_timelines')
        ? startedOverview()
        : { status: false, message: 'Rejected' },
    ),
  );
  expect(await controller.saveTask(new StoreTaskParams(18, 'Task'))).toBeInstanceOf(DataFailed);
  expect(post).toHaveBeenCalledTimes(2);
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
            work_status: 1,
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
    data: { quote_id: 140, work_status: 1 },
  });
  expect(controller.stages.value[0]?.id).toBe(18);
});
it('keeps submission disabled while authoritative refresh is pending', async () => {
  const pending = deferred();
  post
    .mockResolvedValueOnce(response(startedOverview()))
    .mockResolvedValueOnce(response({ status: true }))
    .mockReturnValueOnce(pending.promise);
  const save = controller.saveTask(new StoreTaskParams(18, 'Task'));
  for (let turn = 0; turn < 20; turn++) await Promise.resolve();
  expect(controller.tasksSaveState.value).toBeInstanceOf(DataLoading);
  expect(await controller.saveTask(new StoreTaskParams(18, 'Task'))).toBeInstanceOf(DataCancelled);
  pending.resolve(response({ status: true, data: [] }));
  await save;
  expect(post).toHaveBeenCalledTimes(3);
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

it('drawing creation accepts only explicit main stages owned by current Quote and refreshes on success', async () => {
  post.mockImplementation(async (request) =>
    response(
      request.url.includes('fetch_project_timelines')
        ? startedOverview()
        : { status: true, data: [] },
    ),
  );
  const params = new StoreShopDrawingQuoteParams({
    quoteId: 140,
    title: 'MEP',
    date: null,
    versionNumber: 'V1',
    file: null,
    projectTimelineStageIds: [18],
  });
  expect(await controller.saveDrawing(params)).toBeInstanceOf(DataFailed);
  expect(post).not.toHaveBeenCalled();
  const group = controller.stagesState.value.data?.[0];
  if (!group) throw new Error('Missing test stage group');
  controller.stagesState.value = new DataSuccess({
    data: [
      new ScheduleGroupModel({
        workStatus: 1,
        ...group,
        stages: [
          new ProjectTimelineStageModel({
            id: 18,
            quoteStageId: 999,
            title: 'Main',
            children: [],
            parentId: null,
          }),
          new ProjectTimelineStageModel({
            id: 19,
            quoteStageId: 888,
            title: 'Child',
            children: [],
            parentId: 18,
          }),
        ],
      }),
    ],
  });
  expect(controller.drawingStages.value.map((stage) => stage.id)).toEqual([18]);
  expect(
    await controller.saveDrawing(
      new StoreShopDrawingQuoteParams({ ...params.fields, quoteId: 141 }),
    ),
  ).toBeInstanceOf(DataFailed);
  expect(
    await controller.saveDrawing(
      new StoreShopDrawingQuoteParams({ ...params.fields, projectTimelineStageIds: [19] }),
    ),
  ).toBeInstanceOf(DataFailed);
  expect(await controller.saveDrawing(params)).toBeInstanceOf(DataSuccess);
  expect(post.mock.calls.map((call) => call[0].url.split('/').pop())).toEqual([
    'fetch_project_timelines',
    'store_shop_drawing_quote',
    'fetch_shop_drawing_quotes',
  ]);
});
it('late drawing fetch and save cannot overwrite the new Quote', async () => {
  const pending = deferred();
  post.mockReturnValueOnce(pending.promise);
  const read = controller.loadDrawings();
  controller.activate(141);
  pending.resolve(response({ status: true, data: [] }));
  await read;
  expect(controller.drawingsState.value.data).toBeNull();
});
it('drawing fetch rejects records belonging to a different Quote', async () => {
  post.mockResolvedValue(
    response({
      status: true,
      data: [
        {
          id: 1,
          employee: { id: 1, name: 'Creator', type: 1 },
          quote_id: 140,
          project_id: 86,
          title: 'MEP',
          date: null,
          version_number: 'V1',
          file: 'https://example.test/drawing.pdf',
          custom_number: 1,
          stages: [{ id: 7, stage: { id: 129, title: 'Main' }, sub_stage: null }],
          created_at: null,
        },
      ],
    }),
  );
  controller.activate(141);
  await controller.loadDrawings();
  expect(controller.drawingsState.value).toBeInstanceOf(DataFailed);
});

it('drawing save blocks duplicates, keeps independent state and ignores late success after Quote switch', async () => {
  controller.stagesState.value = new DataSuccess({
    data: [
      new ScheduleGroupModel({
        workStatus: 1,
        id: 2,
        title: 'Main',
        duration: 1,
        durationType: 4,
        stages: [
          new ProjectTimelineStageModel({
            id: 7,
            quoteStageId: 999,
            title: 'Main',
            children: [],
            parentId: null,
          }),
        ],
      }),
    ],
  });
  const params = new StoreShopDrawingQuoteParams({
    quoteId: 140,
    title: 'MEP',
    date: null,
    versionNumber: 'V1',
    file: null,
    projectTimelineStageIds: [7],
  });
  const pending = deferred();
  post.mockReturnValueOnce(pending.promise);
  const saving = controller.saveDrawing(params);
  expect(controller.drawingsSaveState.value).toBeInstanceOf(DataLoading);
  expect(controller.tasksSaveState.value).not.toBeInstanceOf(DataLoading);
  expect(await controller.saveDrawing(params)).toBeInstanceOf(DataCancelled);
  controller.activate(141);
  pending.resolve(response({ status: true }));
  expect(await saving).toBeInstanceOf(DataCancelled);
  expect(post).toHaveBeenCalledTimes(1);
  expect(controller.drawingsState.value.data).toBeNull();
});
