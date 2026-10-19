import ScheduleApiService from '../../../data/api/schedule.api-service';
import ExecutionQuoteApiService from '../../../../data/api/execution.quote.api-service';
import { beforeEach, expect, it, vi } from 'vitest';
import {
  DataSuccess,
  DataLoading,
  DataCancelled,
  DataFailed,
} from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import { ErrorModel, ErrorType } from '@/base/Core/NetworkStructure/Resources/errors/errorModel';
import PaginationModel from '@/base/Core/Models/paginationModel';
import ScheduleController from '../schedule.controller';
import ScheduleRepository from '../../../data/repositories/schedule.repository';
import StageRepository from '@/modules/shared/Stages/data/repositories/stage.repository';
import ExecutionQuoteRepository from '../../../../data/repositories/execution.quote.repository';
import ExecutionQuoteShowModel from '../../../../core/models/execution.quote.show.model';
import type ProjectTimelineOverviewModel from '../../../core/models/project.timeline.overview.model';
import ScheduleSettingsModel from '../../../core/models/schedule.settings.model';
import ScheduleOwnerParams from '../../../core/params/schedule.owner.params';
import ScheduleGroupParams from '../../../core/params/schedule.group.params';
import ProjectTimelineStageParams from '../../../core/params/project.timeline.stage.params';
import { groupFixture, overviewFixture } from './fixtures';
import ScheduleGroupModel from '../../../core/models/schedule.group.model';
import ProjectTimelineWorkStatusModel from '../../../core/models/project.timeline.work-status.model';
import ProjectTimelineHistoryModel from '../../../core/models/project.timeline.history.model';
import {
  ChangeTimelineApprovalParams,
  ChangeTimelineWorkStatusParams,
} from '../../../core/params/schedule.status.params';
const controller = ScheduleController.getInstance();
const repository = ScheduleRepository.getInstance();
const form = () =>
  new ScheduleGroupParams({
    quoteId: 101,
    title: 'First Fix',
    duration: 6,
    durationType: 1,
    stages: [new ProjectTimelineStageParams(10, [11])],
  });
beforeEach(() => {
  vi.restoreAllMocks();
  controller.release();
  controller.activate(101);
  vi.spyOn(repository, 'readSettings').mockResolvedValue(
    new DataSuccess({ data: new ScheduleSettingsModel(undefined, []) }),
  );
});
it('uses the returned Quote approval and refetches actual Group statuses without starting Groups locally', async () => {
  controller.ownerState.value = new DataSuccess({
    data: new ExecutionQuoteShowModel({ id: 101, timelineStatus: 1 }),
  });
  const first = groupFixture(201);
  const second = groupFixture(202);
  controller.listState.value = new DataSuccess({ data: [first, second] });
  const approval = vi.spyOn(repository, 'changeApproval').mockResolvedValue(
    new DataSuccess({
      data: new ExecutionQuoteShowModel({
        id: 101,
        timelineStatus: 3,
        approvedByEmployeeId: 7,
        timelineNote: 'Approved',
      }),
    }),
  );
  vi.spyOn(ExecutionQuoteRepository.getInstance(), 'show').mockResolvedValue(
    new DataSuccess({
      data: new ExecutionQuoteShowModel({ id: 101, timelineStatus: 3, approvedByEmployeeId: 7 }),
    }),
  );
  vi.spyOn(repository, 'readOverview').mockResolvedValue(
    new DataSuccess({
      data: overviewFixture([
        new ScheduleGroupModel({ ...first, workStatus: 1 }),
        new ScheduleGroupModel({ ...second, workStatus: null }),
      ]),
    }),
  );
  const work = vi.spyOn(repository, 'changeWorkStatus');
  expect(
    await controller.changeApproval(new ChangeTimelineApprovalParams(101, 3, 'Approved')),
  ).toBeInstanceOf(DataSuccess);
  expect(approval).toHaveBeenCalledOnce();
  expect(controller.ownerState.value.data?.approvedByEmployeeId).toBe(7);
  expect(controller.listState.value.data?.map((group) => group.workStatus)).toEqual([1, null]);
  expect(work).not.toHaveBeenCalled();
});
it('refreshes the authoritative Quote and Groups after rejecting a pending timeline', async () => {
  controller.ownerState.value = new DataSuccess({
    data: new ExecutionQuoteShowModel({ id: 101, timelineStatus: 1 }),
  });
  const group = new ScheduleGroupModel({ ...groupFixture(201), workStatus: null });
  const mutation = vi
    .spyOn(repository, 'changeApproval')
    .mockResolvedValue(
      new DataSuccess({ data: new ExecutionQuoteShowModel({ id: 101, timelineStatus: 2 }) }),
    );
  const quote = vi
    .spyOn(ExecutionQuoteRepository.getInstance(), 'show')
    .mockResolvedValue(
      new DataSuccess({ data: new ExecutionQuoteShowModel({ id: 101, timelineStatus: 2 }) }),
    );
  const groups = vi
    .spyOn(repository, 'readOverview')
    .mockResolvedValue(new DataSuccess({ data: overviewFixture([group]) }));
  const result = await controller.changeApproval(
    new ChangeTimelineApprovalParams(101, 2, 'Revise'),
  );
  expect(result).toBeInstanceOf(DataSuccess);
  expect(mutation.mock.calls[0][0].toMap()).toEqual({
    quote_id: 101,
    timeline_status: 2,
    timeline_note: 'Revise',
  });
  expect(quote).toHaveBeenCalledOnce();
  expect(groups).toHaveBeenCalledOnce();
  expect(controller.ownerState.value.data?.timelineStatus).toBe(2);
  expect(controller.listState.value.data?.[0].workStatus).toBeNull();
});
it('keeps the prior Quote status and Groups after a rejected approval request fails', async () => {
  controller.ownerState.value = new DataSuccess({
    data: new ExecutionQuoteShowModel({ id: 101, timelineStatus: 1 }),
  });
  const group = new ScheduleGroupModel({ ...groupFixture(201), workStatus: null });
  controller.listState.value = new DataSuccess({ data: [group] });
  vi.spyOn(repository, 'changeApproval').mockResolvedValue(
    new DataFailed({ error: new ErrorModel('Rejection denied', ErrorType.serviceSide) }),
  );
  const quote = vi.spyOn(ExecutionQuoteRepository.getInstance(), 'show');
  const groups = vi.spyOn(repository, 'readOverview');
  const result = await controller.changeApproval(new ChangeTimelineApprovalParams(101, 2));
  expect(result).toBeInstanceOf(DataFailed);
  expect(controller.ownerState.value.data?.timelineStatus).toBe(1);
  expect(controller.listState.value.data?.[0].workStatus).toBeNull();
  expect(quote).not.toHaveBeenCalled();
  expect(groups).not.toHaveBeenCalled();
});
it('updates only one Group and supports several Working Groups without sequence gating', async () => {
  controller.ownerState.value = new DataSuccess({
    data: new ExecutionQuoteShowModel({ id: 101, timelineStatus: 3 }),
  });
  const groups = [
    new ScheduleGroupModel({ ...groupFixture(201), workStatus: 1 }),
    new ScheduleGroupModel({ ...groupFixture(202), workStatus: 2 }),
    new ScheduleGroupModel({ ...groupFixture(203), workStatus: 1 }),
    new ScheduleGroupModel({ ...groupFixture(204), workStatus: null }),
  ];
  controller.listState.value = new DataSuccess({ data: groups });
  let refresh!: (state: DataSuccess<ProjectTimelineOverviewModel>) => void;
  vi.spyOn(repository, 'readOverview').mockImplementationOnce(
    () =>
      new Promise((resolve) => {
        refresh = resolve;
      }),
  );
  const mutation = vi.spyOn(repository, 'changeWorkStatus').mockResolvedValue(
    new DataSuccess({
      data: new ProjectTimelineWorkStatusModel(202, 101, 1),
    }),
  );
  const pending = controller.changeWorkStatus(new ChangeTimelineWorkStatusParams(202, 1));
  await Promise.resolve();
  expect(controller.listState.value.data?.map((group) => group.workStatus)).toEqual([
    1,
    1,
    1,
    null,
  ]);
  expect(
    await controller.changeWorkStatus(new ChangeTimelineWorkStatusParams(202, 1)),
  ).toBeInstanceOf(DataCancelled);
  refresh(
    new DataSuccess({
      data: overviewFixture(
        groups.map((group) =>
          group.id === 202 ? new ScheduleGroupModel({ ...group, workStatus: 1 }) : group,
        ),
      ),
    }),
  );
  expect(await pending).toBeInstanceOf(DataSuccess);
  expect(mutation).toHaveBeenCalledOnce();
  expect(controller.listState.value.data?.map((group) => group.workStatus)).toEqual([
    1,
    1,
    1,
    null,
  ]);
  expect(
    await controller.changeWorkStatus(new ChangeTimelineWorkStatusParams(202, 1)),
  ).toBeInstanceOf(DataCancelled);
});
it('keeps Group history scoped when switching Groups or Quotes', async () => {
  controller.listState.value = new DataSuccess({ data: [groupFixture(201), groupFixture(202)] });
  let finishA!: (state: DataSuccess<ProjectTimelineHistoryModel[]>) => void;
  let finishB!: (state: DataSuccess<ProjectTimelineHistoryModel[]>) => void;
  vi.spyOn(repository, 'readHistory')
    .mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          finishA = resolve;
        }),
    )
    .mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          finishB = resolve;
        }),
    );
  const first = controller.readHistory(201);
  const second = controller.readHistory(202);
  const entry = new ProjectTimelineHistoryModel(1, 201, 1, null, null, null, '2026-10-18 12:10:58');
  finishA(new DataSuccess({ data: [entry] }));
  expect(await first).toBeInstanceOf(DataCancelled);
  expect(controller.historyState.value.data).toBeNull();
  finishB(
    new DataSuccess({
      data: [new ProjectTimelineHistoryModel(2, 202, 2, 1, null, null, '2026-10-18 12:12:50')],
    }),
  );
  expect(await second).toBeInstanceOf(DataSuccess);
  expect(controller.historyState.value.data?.[0]?.projectTimelineId).toBe(202);
  controller.activate(102);
  expect(controller.historyState.value.data).toBeNull();
});
it('discards a late history response after navigating to a different Quote', async () => {
  controller.listState.value = new DataSuccess({ data: [groupFixture(201)] });
  let finish!: (state: DataSuccess<ProjectTimelineHistoryModel[]>) => void;
  vi.spyOn(repository, 'readHistory').mockImplementationOnce(
    () =>
      new Promise((resolve) => {
        finish = resolve;
      }),
  );
  const pending = controller.readHistory(201);
  controller.activate(102);
  finish(
    new DataSuccess({
      data: [new ProjectTimelineHistoryModel(1, 201, 1, null, null, null, '2026-10-18 12:10:58')],
    }),
  );
  expect(await pending).toBeInstanceOf(DataCancelled);
  expect(controller.historyState.value.data).toBeNull();
  expect(controller.historyGroupId.value).toBeNull();
});
it('prevents stale or rejected Group status responses from changing other Groups', async () => {
  controller.ownerState.value = new DataSuccess({
    data: new ExecutionQuoteShowModel({ id: 101, timelineStatus: 3 }),
  });
  controller.listState.value = new DataSuccess({
    data: [new ScheduleGroupModel({ ...groupFixture(201), workStatus: null })],
  });
  let finish!: (state: DataSuccess<ProjectTimelineWorkStatusModel>) => void;
  vi.spyOn(repository, 'changeWorkStatus').mockImplementationOnce(
    () =>
      new Promise((resolve) => {
        finish = resolve;
      }),
  );
  const pending = controller.changeWorkStatus(new ChangeTimelineWorkStatusParams(201, 1));
  controller.activate(102);
  finish(new DataSuccess({ data: new ProjectTimelineWorkStatusModel(201, 101, 1) }));
  expect(await pending).toBeInstanceOf(DataCancelled);
  expect(controller.workStatusState.value.data).toBeNull();
  expect(controller.listState.value.data).toBeNull();
});
it('keeps known Group status on a backend failure and rejects an unchanged status', async () => {
  controller.ownerState.value = new DataSuccess({
    data: new ExecutionQuoteShowModel({ id: 101, timelineStatus: 3 }),
  });
  controller.listState.value = new DataSuccess({
    data: [new ScheduleGroupModel({ ...groupFixture(201), workStatus: 2 })],
  });
  const failure = new DataFailed<ProjectTimelineWorkStatusModel>({
    error: new ErrorModel('Transition denied', ErrorType.serviceSide),
  });
  const mutation = vi.spyOn(repository, 'changeWorkStatus').mockResolvedValue(failure);
  expect(
    await controller.changeWorkStatus(new ChangeTimelineWorkStatusParams(201, 2)),
  ).toBeInstanceOf(DataCancelled);
  expect(await controller.changeWorkStatus(new ChangeTimelineWorkStatusParams(201, 3))).toBe(
    failure,
  );
  expect(controller.listState.value.data?.[0]?.workStatus).toBe(2);
  expect(controller.workStatusState.value.error?.displayMessage).toBe('Transition denied');
  expect(mutation).toHaveBeenCalledOnce();
});
it('does not assign a late previous-Quote approval result or refresh its Groups', async () => {
  controller.ownerState.value = new DataSuccess({
    data: new ExecutionQuoteShowModel({ id: 101, timelineStatus: 1 }),
  });
  let finish!: (state: DataSuccess<ExecutionQuoteShowModel>) => void;
  vi.spyOn(repository, 'changeApproval').mockImplementationOnce(
    () =>
      new Promise((resolve) => {
        finish = resolve;
      }),
  );
  const list = vi.spyOn(repository, 'readOverview');
  const pending = controller.changeApproval(new ChangeTimelineApprovalParams(101, 3));
  controller.activate(102);
  finish(new DataSuccess({ data: new ExecutionQuoteShowModel({ id: 101, timelineStatus: 3 }) }));
  expect(await pending).toBeInstanceOf(DataCancelled);
  expect(controller.ownerState.value.data).toBeNull();
  expect(list).not.toHaveBeenCalled();
});
it('discards previous-owner list and settings results before shared state assignment', async () => {
  let completeList!: (state: DataSuccess<ProjectTimelineOverviewModel>) => void;
  let completeSettings!: (state: DataSuccess<ScheduleSettingsModel>) => void;
  vi.spyOn(repository, 'readOverview').mockImplementationOnce(
    () =>
      new Promise((resolve) => {
        completeList = resolve;
      }),
  );
  vi.spyOn(repository, 'readSettings').mockImplementationOnce(
    () =>
      new Promise((resolve) => {
        completeSettings = resolve;
      }),
  );
  const list = controller.fetchList(new ScheduleOwnerParams(101));
  const settings = controller.readSettings(new ScheduleOwnerParams(101));
  controller.activate(102);
  completeList(new DataSuccess({ data: overviewFixture([groupFixture()]) }));
  completeSettings(new DataSuccess({ data: new ScheduleSettingsModel('2026-10-09', []) }));
  expect(await list).toBeInstanceOf(DataCancelled);
  expect(await settings).toBeInstanceOf(DataCancelled);
  expect(controller.listState.value.data).toBeNull();
  expect(controller.settingsState.value.data).toBeNull();
});
it('discards previous-group details on direct navigation to a different group', async () => {
  controller.activate(101, 201);
  let complete!: (state: DataSuccess<ReturnType<typeof groupFixture>>) => void;
  vi.spyOn(repository, 'show').mockImplementationOnce(
    () =>
      new Promise((resolve) => {
        complete = resolve;
      }),
  );
  const previous = controller.fetchOne(new ScheduleOwnerParams(101, 201));
  controller.activate(101, 202);
  complete(new DataSuccess({ data: groupFixture() }));
  expect(await previous).toBeInstanceOf(DataCancelled);
  expect(controller.itemState.value.data).toBeNull();
});
it('never assigns stale QuoteStage lookup results when the owner changes', async () => {
  let complete!: (state: DataSuccess<ExecutionQuoteShowModel>) => void;
  vi.spyOn(ExecutionQuoteRepository.getInstance(), 'show').mockImplementationOnce(
    () =>
      new Promise((resolve) => {
        complete = resolve;
      }),
  );
  const previous = controller.lookup(10);
  controller.activate(102);
  complete(new DataSuccess({ data: new ExecutionQuoteShowModel({ id: 101, quoteStages: [] }) }));
  await previous;
  expect(controller.lookups.value.size).toBe(0);
});
it('requires a complete sequence and persists a one-based move before authoritative refetch', async () => {
  const first = groupFixture(201);
  const second = groupFixture(202);
  vi.spyOn(repository, 'readOverview')
    .mockResolvedValueOnce(new DataSuccess({ data: overviewFixture([first, second]) }))
    .mockResolvedValueOnce(new DataSuccess({ data: overviewFixture([second, first]) }));
  vi.spyOn(repository, 'readSettings').mockResolvedValue(
    new DataSuccess({ data: new ScheduleSettingsModel(undefined, []) }),
  );
  const sort = vi
    .spyOn(repository, 'changeProjectTimelineOrder')
    .mockResolvedValue(new DataSuccess({}));
  await controller.fetchList(new ScheduleOwnerParams(101));
  expect(controller.canMove(201, -1)).toBe(false);
  expect(controller.canMove(202, 1)).toBe(false);
  await controller.changeProjectTimelineOrder(201, 2);
  expect(sort.mock.calls[0]?.[0].toMap()).toEqual({
    project_timeline_id: 201,
    order: 2,
  });
  expect(controller.listState.value.data?.map((group) => group.id)).toEqual([202, 201]);
});
it('does not reorder a paginated fragment', async () => {
  vi.spyOn(repository, 'readOverview').mockResolvedValue(
    new DataSuccess({
      data: overviewFixture([groupFixture(), groupFixture(202)]),
      pagination: PaginationModel.fromTotal(20, 2),
    }),
  );
  await controller.fetchList(new ScheduleOwnerParams(101));
  expect(controller.canMove(201, 1)).toBe(false);
});
it('clears calculated finish after deleting the last group and leaves Stage master records untouched', async () => {
  vi.spyOn(repository, 'readOverview')
    .mockResolvedValueOnce(
      new DataSuccess({ data: overviewFixture([groupFixture(201, '2026-10-20')]) }),
    )
    .mockResolvedValueOnce(new DataSuccess({ data: overviewFixture([]) }));
  vi.spyOn(repository, 'readSettings').mockResolvedValue(
    new DataSuccess({ data: new ScheduleSettingsModel(undefined, []) }),
  );
  vi.spyOn(repository, 'delete').mockResolvedValue(new DataSuccess({}));
  const stageDelete = vi.spyOn(StageRepository.getInstance(), 'delete');
  await controller.fetchList(new ScheduleOwnerParams(101));
  expect(controller.calculatedFinish.value).toBe('2026-10-20');
  await controller.delete(new ScheduleOwnerParams(101, 201));
  expect(controller.calculatedFinish.value).toBeUndefined();
  expect(stageDelete).not.toHaveBeenCalled();
});
it('distinguishes successful save from refresh failure and never retries creation', async () => {
  const create = vi
    .spyOn(repository, 'create')
    .mockResolvedValue(new DataSuccess({ data: groupFixture() }));
  const failed = new DataFailed<ProjectTimelineOverviewModel>({
    error: new ErrorModel('network failure', ErrorType.networkConnection),
  });
  vi.spyOn(repository, 'readOverview').mockResolvedValue(failed);
  expect(await controller.create(form())).toBeInstanceOf(DataSuccess);
  expect(controller.refreshFailed.value).toBe(true);
  expect(create).toHaveBeenCalledOnce();
});
it('prevents duplicate submissions and stale mutation success after changing owner', async () => {
  let complete!: (state: DataSuccess<ReturnType<typeof groupFixture>>) => void;
  const create = vi.spyOn(repository, 'create').mockImplementationOnce(
    () =>
      new Promise((resolve) => {
        complete = resolve;
      }),
  );
  const previous = controller.create(form());
  expect(await controller.create(form())).toBeInstanceOf(DataCancelled);
  controller.activate(102);
  complete(new DataSuccess({ data: groupFixture() }));
  expect(await previous).toBeInstanceOf(DataCancelled);
  expect(controller.mutationState.value.data).toBeNull();
  expect(controller.busy.value).toBe(false);
  expect(create).toHaveBeenCalledOnce();
});
it('rejects known QuoteStage/SubStage mismatches', async () => {
  const owner = ExecutionQuoteShowModel.fromJson({
    id: 101,
    quote_stages: [
      {
        id: 20,
        stage: { id: 99, title: 'Master Stage' },
        sub_stages: [{ id: 11, sub_stage: { id: 99, title: 'Child' } }],
      },
    ],
  });
  controller.ownerState.value = new DataSuccess({ data: owner });
  await controller.lookup(20);
  expect(await controller.create(form())).toBeInstanceOf(DataFailed);
});
it('does not let an old-owner mutation reset the new-owner busy state', async () => {
  let finishOld!: (state: DataSuccess<ReturnType<typeof groupFixture>>) => void;
  let finishNew!: (state: DataSuccess<ReturnType<typeof groupFixture>>) => void;
  vi.spyOn(repository, 'create')
    .mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          finishOld = resolve;
        }),
    )
    .mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          finishNew = resolve;
        }),
    );
  const oldSave = controller.create(form());
  controller.activate(102);
  const nextForm = form();
  nextForm.quoteId = 102;
  const newSave = controller.create(nextForm);
  finishOld(new DataSuccess({ data: groupFixture() }));
  await oldSave;
  expect(controller.busy.value).toBe(true);
  expect(controller.mutationState.value).toBeInstanceOf(DataLoading);
  finishNew(new DataSuccess({ data: groupFixture(202) }));
  await newSave;
  expect(controller.busy.value).toBe(false);
});
it('rejects an owner read that reports success without the requested Quote', async () => {
  vi.spyOn(ExecutionQuoteApiService.getInstance(), 'show').mockResolvedValue({
    statusCode: 200,
    data: { status: true },
  });
  await controller.readOwner();
  expect(controller.ownerState.value).toBeInstanceOf(DataFailed);
  expect(controller.ownerState.value.data).toBeNull();
});

it('shares concurrent overview reads and reuses loaded metrics for the same owner', async () => {
  let finish!: (state: DataSuccess<ProjectTimelineOverviewModel>) => void;
  const read = vi.spyOn(repository, 'readOverview').mockImplementationOnce(
    () =>
      new Promise((resolve) => {
        finish = resolve;
      }),
  );
  const first = controller.readOverview(101);
  const second = controller.readOverview(101);
  expect(read).toHaveBeenCalledOnce();
  finish(new DataSuccess({ data: overviewFixture([groupFixture()]) }));
  await first;
  await second;
  await controller.fetchList(new ScheduleOwnerParams(101));
  expect(read).toHaveBeenCalledOnce();
});
it('does not assign an old-owner overview or report a stale reorder success', async () => {
  let finishRead!: (state: DataSuccess<ProjectTimelineOverviewModel>) => void;
  vi.spyOn(repository, 'readOverview').mockImplementationOnce(
    () =>
      new Promise((resolve) => {
        finishRead = resolve;
      }),
  );
  const read = controller.readOverview(101);
  controller.activate(102);
  finishRead(new DataSuccess({ data: overviewFixture([groupFixture()]) }));
  expect(await read).toBeInstanceOf(DataCancelled);
  expect(controller.overviewState.value.data).toBeNull();
  controller.activate(101);
  controller.listState.value = new DataSuccess({ data: [groupFixture(), groupFixture(202)] });
  controller.completeSequence.value = true;
  let finishMove!: (state: DataSuccess<void>) => void;
  const move = vi.spyOn(repository, 'changeProjectTimelineOrder').mockImplementationOnce(
    () =>
      new Promise((resolve) => {
        finishMove = resolve;
      }),
  );
  const pending = controller.changeProjectTimelineOrder(201, 2);
  expect(await controller.changeProjectTimelineOrder(202, 1)).toBeInstanceOf(DataCancelled);
  controller.activate(102);
  finishMove(new DataSuccess({}));
  expect(await pending).toBeInstanceOf(DataCancelled);
  expect(controller.mutationState.value.data).toBeNull();
  expect(move).toHaveBeenCalledOnce();
});
it('uses direct QuoteStage and child record IDs while displaying master labels', async () => {
  const owner = ExecutionQuoteShowModel.fromJson({
    id: 101,
    quote_stages: [
      {
        id: 103,
        stage: { id: 500, title: 'Electrical' },
        sub_stages: [{ id: 987, sub_stage: { id: 12, title: 'First Fix' } }],
      },
    ],
  });
  controller.ownerState.value = new DataSuccess({ data: owner });
  await controller.lookup(null);
  await controller.lookup(103);
  expect(controller.lookups.value.get(null)?.data?.[0]?.id).toBe(103);
  expect(controller.lookups.value.get(103)?.data?.[0]?.id).toBe(987);
  expect(controller.lookups.value.get(103)?.data?.[0]?.title).toBe('First Fix');
  expect(controller.childLabels.value.has(12)).toBe(false);
  expect(controller.lookups.value.get(null)?.data?.[0]?.id).not.toBe(500);
});

it('preserves the loaded Edit detail when BaseController update returns validation errors', async () => {
  controller.activate(101, 201);
  const group = groupFixture();
  controller.itemState.value = new DataSuccess({ data: group });
  const loadedDetail = controller.itemState.value;
  const failure = new DataFailed<ReturnType<typeof groupFixture>>({
    error: new ErrorModel('Title rejected', ErrorType.validation),
  });
  vi.spyOn(repository, 'update').mockResolvedValue(failure);
  const params = form();
  params.groupId = 201;
  expect(await controller.update(params)).toBe(failure);
  expect(controller.itemState.value).toBe(loadedDetail);
  expect(controller.mutationState.value.error?.displayMessage).toBe('Title rejected');
  expect(controller.busy.value).toBe(false);
});

it('blocks editing, deleting and reordering approved timelines before sending requests', async () => {
  controller.activate(101, 201);
  controller.ownerState.value = new DataSuccess({
    data: new ExecutionQuoteShowModel({ id: 101, timelineStatus: 3 }),
  });
  controller.listState.value = new DataSuccess({ data: [groupFixture(201), groupFixture(202)] });
  controller.completeSequence.value = true;
  const api = ScheduleApiService.getInstance();
  const update = vi.spyOn(api, 'update');
  const remove = vi.spyOn(api, 'delete');
  const sort = vi.spyOn(api, 'sort');
  const changes = new ScheduleGroupParams({ ...form(), groupId: 201 });
  expect(await controller.update(changes)).toBeInstanceOf(DataCancelled);
  expect(await controller.delete(new ScheduleOwnerParams(101, 201))).toBeInstanceOf(DataCancelled);
  expect(await controller.changeProjectTimelineOrder(201, 2)).toBeInstanceOf(DataCancelled);
  expect(controller.canMove(201, 1)).toBe(false);
  expect(update).not.toHaveBeenCalled();
  expect(remove).not.toHaveBeenCalled();
  expect(sort).not.toHaveBeenCalled();
  expect(controller.busy.value).toBe(false);
});
