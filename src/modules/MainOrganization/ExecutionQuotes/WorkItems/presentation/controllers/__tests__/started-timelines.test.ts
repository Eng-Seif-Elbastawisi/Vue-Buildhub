import { beforeEach, expect, it } from 'vitest';
import {
  DataSuccess,
  DataFailed,
  DataCancelled,
} from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import { mockNetwork, response } from '../../../../SiteTeam/__tests__/network';
import {
  overviewRecord,
  timelineGroup,
  storeParams,
} from '../../../../Procurement/__tests__/fixtures';
import WorkItemsController from '../work-items.controller';
import PurchaseRequestController from '../../../../Procurement/presentation/controllers/purchase-request.controller';
import ScheduleRepository from '../../../../Schedule/data/repositories/schedule.repository';
import ScheduleOwnerParams from '../../../../Schedule/core/params/schedule.owner.params';
import StoreTaskParams from '../../../core/params/store.task.params';
const controller = WorkItemsController.getInstance();
let post: ReturnType<typeof mockNetwork>;
beforeEach(() => {
  post = mockNetwork();
  controller.activate(140);
});
const overview = (groups: unknown[]) => ({
  ...overviewRecord(),
  data: { basicData: { count_timeline: groups.length }, data: groups },
});
it('execution selectors request START and keep multiple START groups while excluding all inactive statuses', async () => {
  const groups = [1, 1, 2, 3, null].map((status, index) => ({
    ...timelineGroup(),
    id: index + 2,
    work_status: status,
    stages: [{ ...timelineGroup().stages[0], id: 17 + index }],
  }));
  post.mockResolvedValue(response(overview(groups)));
  await controller.loadStages();
  const requests = PurchaseRequestController.getInstance();
  requests.activate(140);
  await requests.loadStages();
  expect(controller.stages.value.map((stage) => stage.id)).toEqual([17, 18]);
  expect(controller.drawingStages.value.map((stage) => stage.id)).toEqual([17, 18]);
  expect(requests.mainStages.value.map((stage) => stage.id)).toEqual([17, 18]);
  for (const call of post.mock.calls)
    expect(call[0].data).toEqual({ quote_id: 140, work_status: 1 });
  await ScheduleRepository.getInstance().readOverview(new ScheduleOwnerParams(140));
  expect(post.mock.calls.at(-1)?.[0].data).toEqual({ quote_id: 140 });
});
it.each([2, 3, null])(
  'a selected group changed to %s cannot submit new work while historical records remain readable',
  async (status) => {
    let currentStatus: number | null = 1;
    post.mockImplementation(async (request) =>
      response(
        request.url.includes('fetch_project_timelines')
          ? overview([{ ...timelineGroup(), work_status: currentStatus }])
          : {
              status: true,
              data: [
                {
                  id: 8,
                  project_timeline_stage_id: 17,
                  employee: { id: 1, name: 'Creator', type: 1 },
                  title: 'Saved task',
                  assigned_employee: null,
                },
              ],
            },
      ),
    );
    await controller.loadStages();
    expect(controller.stages.value[0]?.id).toBe(17);
    currentStatus = status;
    expect(await controller.saveTask(new StoreTaskParams(17, 'New task'))).toBeInstanceOf(
      DataFailed,
    );
    expect(post.mock.calls.some((call) => call[0].url.includes('store_'))).toBe(false);
    await controller.loadTasks();
    expect(controller.tasksState.value.data?.[0]?.title).toBe('Saved task');
    expect(post.mock.calls.at(-1)?.[0].data).toEqual({ quote_id: 140 });
  },
);
it('new work submits association IDs after a fresh eligibility read and refreshes authoritative history', async () => {
  post.mockImplementation(async (request) =>
    response(
      request.url.includes('fetch_project_timelines')
        ? overview([{ ...timelineGroup(), work_status: 1 }])
        : { status: true, data: [] },
    ),
  );
  await controller.loadStages();
  expect(await controller.saveTask(new StoreTaskParams(17, 'Electrical'))).toBeInstanceOf(
    DataSuccess,
  );
  const writes = post.mock.calls.filter((call) => call[0].url.includes('store_'));
  expect(writes).toHaveLength(1);
  expect(writes[0]?.[0].data).toEqual({
    project_timeline_stage_id: 17,
    title: 'Electrical',
    end_date: null,
    employee_id: null,
  });
  const procurement = PurchaseRequestController.getInstance();
  procurement.activate(140);
  await procurement.loadStages();
  expect(await procurement.create(storeParams())).toBeInstanceOf(DataSuccess);
  expect(
    post.mock.calls.find((call) => call[0].url.includes('store_purchase_request'))?.[0].data
      .items[0].project_timeline_stage_id,
  ).toBe(17);
});
it('a late Quote A eligibility read cannot overwrite Quote B or submit A work', async () => {
  let finish!: (record: ReturnType<typeof response>) => void;
  post.mockResolvedValueOnce(response(overview([{ ...timelineGroup(), work_status: 1 }])));
  await controller.loadStages();
  post.mockImplementationOnce(
    () =>
      new Promise((resolve) => {
        finish = resolve;
      }),
  );
  const saving = controller.saveTask(new StoreTaskParams(17, 'Old'));
  controller.activate(141);
  post.mockResolvedValue(
    response(
      overview([
        {
          ...timelineGroup(),
          id: 5,
          work_status: 1,
          stages: [{ ...timelineGroup().stages[0], id: 99 }],
        },
      ]),
    ),
  );
  await controller.loadStages();
  finish(response(overview([{ ...timelineGroup(), work_status: 1 }])));
  expect(await saving).toBeInstanceOf(DataCancelled);
  expect(controller.stages.value.map((stage) => stage.id)).toEqual([99]);
  expect(post.mock.calls.some((call) => call[0].url.includes('store_'))).toBe(false);
});

import StoreShopDrawingQuoteParams from '../../../core/params/store.shop-drawing.params';
import StoreReportParams from '../../../core/params/store.report.params';
import ReportAttachmentParams from '../../../core/params/report.attachment.params';
it('space lookups use the linked Project and Store uses its floor-space association rather than the master Space', async () => {
  post.mockImplementation(async (request) =>
    response(
      request.url.includes('show_quote')
        ? { status: true, data: { id: 140, project: { id: 86, title: 'Linked Project' } } }
        : request.url.includes('fetch_project_timelines')
          ? overview([{ ...timelineGroup(), work_status: 1 }])
          : request.url.includes('fetch_project_floors')
            ? {
                status: true,
                data: [
                  {
                    id: 23,
                    project: { id: 86, title: 'Linked Project' },
                    spaces: [{ id: 170, space: { id: 8, title: 'Kitchen' }, attachments: [] }],
                  },
                ],
              }
            : { status: true, data: [] },
    ),
  );
  await Promise.all([controller.loadStages(), controller.loadSpaces()]);
  expect(controller.spaceOptions.value.map((option) => option.id)).toEqual([170]);
  const floorRead = post.mock.calls.find((call) => call[0].data.project_id !== undefined);
  expect(floorRead?.[0].data.project_id).toBe(86);
  const drawing = new StoreShopDrawingQuoteParams({
    quoteId: 140,
    title: 'MEP',
    date: '2026-10-12',
    versionNumber: 'V1',
    file: 'data:image/jpeg;base64,YQ==',
    projectTimelineStageIds: [17],
    projectFloorSpaceId: 170,
  });
  expect(
    await controller.saveDrawing(
      new StoreShopDrawingQuoteParams({ ...drawing.fields, projectFloorSpaceId: 8 }),
    ),
  ).toBeInstanceOf(DataFailed);
  expect(await controller.saveDrawing(drawing)).toBeInstanceOf(DataSuccess);
  const drawingWrite = post.mock.calls.find((call) =>
    call[0].url.includes('store_shop_drawing_quote'),
  );
  expect(drawingWrite?.[0].data.project_floor_space_id).toBe(170);
  expect(drawingWrite?.[0].data).not.toHaveProperty('custom_number');
  const report = new StoreReportParams(17, '2026-10-12', 'Notes', 1, 2, 170, [
    new ReportAttachmentParams('data:image/jpeg;base64,YQ=='),
    new ReportAttachmentParams('data:image/jpeg;base64,Yg=='),
  ]);
  expect(await controller.saveReport(report)).toBeInstanceOf(DataSuccess);
  const reportWrite = post.mock.calls.find((call) =>
    call[0].url.includes('store_project_timeline_stage_report'),
  );
  expect(reportWrite?.[0].data).toMatchObject({
    project_timeline_stage_id: 17,
    report_scope_type: 2,
    project_floor_space_id: 170,
    attachments: [{ file: 'data:image/jpeg;base64,YQ==' }, { file: 'data:image/jpeg;base64,Yg==' }],
  });
});
