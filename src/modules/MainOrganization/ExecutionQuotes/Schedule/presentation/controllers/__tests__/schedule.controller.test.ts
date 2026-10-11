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
