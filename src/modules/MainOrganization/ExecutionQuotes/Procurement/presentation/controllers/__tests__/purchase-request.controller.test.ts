import { beforeEach, expect, it, vi } from 'vitest';
import {
  DataInitial,
  DataSuccess,
  DataFailed,
  DataCancelled,
} from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import IndexEmployeeParams from '@/modules/MainOrganization/employee/core/params/index.employee.params';
import IndexMaterialParams from '@/modules/shared/Materials/core/params/index.materials.params';
import ExecutionQuoteShowModel from '../../../../core/models/execution.quote.show.model';
import PurchaseRequestItemParams from '../../../core/params/purchase-request.item.params';
import ScheduleGroupModel from '../../../../Schedule/core/models/schedule.group.model';
import PurchaseRequestController from '../purchase-request.controller';
import { mockNetwork, response } from '../../../../SiteTeam/__tests__/network';
import {
  requestRecord,
  storeParams,
  floorRecord,
  timelineGroup,
  overviewRecord,
} from '../../../__tests__/fixtures';
let post: ReturnType<typeof mockNetwork>;
const controller = PurchaseRequestController.getInstance();
beforeEach(() => {
  post = mockNetwork();
  controller.activate(140);
});
it('preserves Employee search pagination without imposing an employee type filter', async () => {
  post.mockResolvedValue(
    response({
      status: true,
      data: {
        data: [{ id: 7, name: 'Responsible Employee' }],
        meta: { current_page: 2, last_page: 3, per_page: 10, total: 25 },
      },
    }),
  );
  const lookup = controller.createLookup('employee');
  const options = await lookup.fetchAsOptions(new IndexEmployeeParams('Magee', 2));
  expect(options[0]?.id).toBe(7);
  expect(lookup.pagination.value?.lastPage).toBe(3);
  expect(post.mock.calls[0]?.[0].data).toMatchObject({
    word: 'Magee',
    page: 2,
    with_pagination: 1,
  });
  expect(post.mock.calls[0]?.[0].data).not.toHaveProperty('type');
});
it('loads only explicit main timeline-stage associations, never master Stage IDs', async () => {
  const main = timelineGroup();
  post.mockResolvedValue(
    response({
      ...overviewRecord(),
      data: {
        basicData: { count_timeline: 1 },
        data: [
          {
            ...main,
            stages: [
              main.stages[0],
              { ...main.stages[0], id: 18, parent_id: 17 },
              { ...main.stages[0], id: 19, parent_id: undefined },
            ],
          },
        ],
      },
    }),
  );
  await controller.loadStages();
  expect(controller.mainStages.value.map((stage) => stage.id)).toEqual([17]);
  expect(post.mock.calls[0]?.[0].data).toEqual({ quote_id: 140, work_status: 1 });
});
it('uses the scoped Project lookup when optional owner metadata is omitted', async () => {
  post
    .mockResolvedValueOnce(
      response({ status: true, data: { project: { id: 86, title: 'Linked Project' } } }),
    )
    .mockResolvedValueOnce(
      response({ status: true, data: [{ id: 23, floor_number: 0, spaces: floorRecord().spaces }] }),
    );
  await controller.loadOwner();
  expect(post.mock.calls[1]?.[0].data).toMatchObject({ project_id: 86 });
  expect(controller.floorsState.value).toBeInstanceOf(DataSuccess);
  expect(controller.floorsState.value.data?.[0]?.spaces[0]?.id).toBe(25);
});
it('resolves the linked Project and rejects floors from another Project', async () => {
  post
    .mockResolvedValueOnce(
      response({ status: true, data: { id: 140, project: { id: 86, title: 'Linked' } } }),
    )
    .mockResolvedValueOnce(response({ status: true, data: [floorRecord()] }));
  await controller.loadOwner();
  expect(controller.projectId.value).toBe(86);
  expect(post.mock.calls[1]?.[0].data).toMatchObject({ project_id: 86 });
  expect(controller.floorsState.value.data?.[0]?.spaces[0]?.id).toBe(25);
  post.mockResolvedValueOnce(
    response({ status: true, data: [{ ...floorRecord(), project: { id: 999 } }] }),
  );
  await controller.loadFloors();
  expect(controller.floorsState.value).toBeInstanceOf(DataFailed);
});
it.each(['list', 'owner', 'stages', 'employee', 'material', 'floors'])(
  'rejects a late %s response after the Quote owner changes',
  async (resource) => {
    let resolve!: (value: ReturnType<typeof response>) => void;
    post.mockImplementationOnce(
      () =>
        new Promise((done) => {
          resolve = done;
        }),
    );
    if (resource === 'floors')
      controller.ownerState.value = new DataSuccess({
        data: ExecutionQuoteShowModel.fromJson({ id: 140, project: { id: 86, title: 'Project' } }),
      });
    const lookup = controller.createLookup(resource === 'material' ? 'material' : 'employee');
    const pending =
      resource === 'list'
        ? controller.fetchList()
        : resource === 'owner'
          ? controller.loadOwner()
          : resource === 'stages'
            ? controller.loadStages()
            : resource === 'floors'
              ? controller.loadFloors()
              : lookup.fetchAsOptions(
                  resource === 'material' ? new IndexMaterialParams() : new IndexEmployeeParams(),
                );
    controller.activate(141);
    resolve(
      response(
        resource === 'list'
          ? { status: true, data: [requestRecord()] }
          : resource === 'stages'
            ? overviewRecord()
            : { status: true, data: [] },
      ),
    );
    await pending;
    expect(controller.listState.value).toBeInstanceOf(DataInitial);
    expect(controller.ownerState.value.data).toBeNull();
    expect(controller.stagesState.value.data).toBeNull();
    expect(controller.floorsState.value.data).toBeNull();
    expect(lookup.state.value.data).toBeNull();
  },
);
it('does not display purchase requests for another Quote', async () => {
  post.mockResolvedValue(response({ status: true, data: [{ ...requestRecord(), quote_id: 141 }] }));
  await controller.fetchList();
  expect(controller.listState.value).toBeInstanceOf(DataFailed);
});
it('rejects master-stage and foreign-space IDs before submitting', async () => {
  controller.stagesState.value = new DataSuccess({
    data: [ScheduleGroupModel.fromJson(timelineGroup())],
  });
  const params = storeParams({ items: [new PurchaseRequestItemParams(129, 'material', 5, 10)] });
  expect(await controller.create(params)).toBeInstanceOf(DataFailed);
  expect(
    await controller.create(storeParams({ isAllProject: false, projectFloorSpaceId: 999 })),
  ).toBeInstanceOf(DataFailed);
  expect(post).not.toHaveBeenCalled();
});
it('blocks duplicate non-idempotent submissions and ignores late Store feedback', async () => {
  controller.stagesState.value = new DataSuccess({
    data: [ScheduleGroupModel.fromJson(timelineGroup())],
  });
  let resolve!: (value: ReturnType<typeof response>) => void;
  post.mockImplementationOnce(
    () =>
      new Promise((done) => {
        resolve = done;
      }),
  );
  const saved = controller.create(storeParams());
  await vi.waitFor(() => expect(post).toHaveBeenCalledTimes(1));
  expect(await controller.create(storeParams())).toBeInstanceOf(DataCancelled);
  controller.activate(141);
  resolve(response({ status: true }));
  expect(await saved).toBeInstanceOf(DataCancelled);
  expect(controller.itemState.value).toBeInstanceOf(DataInitial);
  expect(post).toHaveBeenCalledTimes(1);
});
it('keeps lookup selections scoped and suppresses out-of-order search results', async () => {
  let resolve!: (value: ReturnType<typeof response>) => void;
  const lookup = controller.createLookup('employee');
  post
    .mockImplementationOnce(
      () =>
        new Promise((done) => {
          resolve = done;
        }),
    )
    .mockResolvedValueOnce(response({ status: true, data: [{ id: 8, name: 'Latest Employee' }] }));
  const first = lookup.fetchAsOptions(new IndexEmployeeParams('old'));
  const latest = await lookup.fetchAsOptions(new IndexEmployeeParams('new'));
  resolve(response({ status: true, data: [{ id: 7, name: 'Old Employee' }] }));
  expect(await first).toEqual([]);
  expect(latest[0]?.title).toBe('Latest Employee');
  expect(lookup.state.value.data?.[0]?.id).toBe(8);
});
