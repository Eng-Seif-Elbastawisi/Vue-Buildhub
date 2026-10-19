import { computed, shallowRef } from 'vue';
import type ChangeProjectConfigurationWorkStatusParams from '../../core/params/change.project.configuration.work-status.params';
import { ProjectWorkStatus } from '../../core/constants/project.work-status';
import BaseController from '@/base/Presentation/Controller/baseController';
import {
  DataInitial,
  DataLoading,
  DataSuccess,
  DataCancelled,
  DataFailed,
  type DataState,
} from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import { ErrorModel, ErrorType } from '@/base/Core/NetworkStructure/Resources/errors/errorModel';
import type Params from '@/base/Core/Params/params';
import TitleModel from '@/base/Core/Models/titleModel';
import ChangeProjectTimelineOrderParams from '../../core/params/change.project.timeline.order.params';
import type ProjectTimelineOverviewModel from '../../core/models/project.timeline.overview.model';
import type ExecutionQuoteShowModel from '../../../core/models/execution.quote.show.model';
import ShowExecutionQuoteParams from '../../../core/params/show.execution.quote.params';
import ExecutionQuoteRepository from '../../../data/repositories/execution.quote.repository';
import type ScheduleSettingsModel from '../../core/models/schedule.settings.model';
import ScheduleOwnerParams from '../../core/params/schedule.owner.params';
import ScheduleGroupParams from '../../core/params/schedule.group.params';
import type ScheduleSettingsParams from '../../core/params/schedule.settings.params';
import type {
  ChangeTimelineApprovalParams,
  ChangeTimelineWorkStatusParams,
} from '../../core/params/schedule.status.params';
import { TimelineApprovalStatus } from '../../core/constants/timeline.status';
import ScheduleGroupModel from '../../core/models/schedule.group.model';
import type ProjectTimelineWorkStatusModel from '../../core/models/project.timeline.work-status.model';
import type ProjectTimelineHistoryModel from '../../core/models/project.timeline.history.model';
import { validId } from '../../core/constants/schedule.constants';
import ScheduleRepository from '../../data/repositories/schedule.repository';

export default class ScheduleController extends BaseController<ScheduleGroupModel> {
  private static instance: ScheduleController;
  private epoch = 0;
  private listRequest = 0;
  private detailRequest = 0;
  private settingsRequest = 0;
  private historyRequest = 0;
  private lookupRequests = new Map<number | null, number>();
  private childParents = new Map<number, number>();
  private overviewRequest = 0;
  private overviewPending: Promise<DataState<ProjectTimelineOverviewModel>> | null = null;
  readonly overviewState = shallowRef<DataState<ProjectTimelineOverviewModel>>(new DataInitial());
  private owner: number | null = null;
  private group: number | null = null;
  readonly settingsState = shallowRef<DataState<ScheduleSettingsModel>>(new DataInitial());
  readonly projectExecutionState = shallowRef<DataState<ScheduleSettingsModel>>(new DataInitial());
  readonly projectExecutionBusy = shallowRef(false);
  readonly projectExecutionRefreshFailed = shallowRef(false);
  readonly ownerState = shallowRef<DataState<ExecutionQuoteShowModel>>(new DataInitial());
  readonly timelineApproved = computed(
    () => this.ownerState.value.data?.timelineStatus === TimelineApprovalStatus.APPROVED,
  );
  readonly approvalState = shallowRef<DataState<ExecutionQuoteShowModel>>(new DataInitial());
  readonly workStatusState = shallowRef<DataState<ProjectTimelineWorkStatusModel>>(
    new DataInitial(),
  );
  readonly historyState = shallowRef<DataState<ProjectTimelineHistoryModel[]>>(new DataInitial());
  readonly historyGroupId = shallowRef<number | null>(null);
  readonly childLabels = shallowRef(new Map<number, TitleModel>());
  readonly stageLabels = shallowRef(new Map<number, TitleModel>());
  readonly lookups = shallowRef(new Map<number | null, DataState<TitleModel[]>>());
  readonly mutationState = shallowRef<DataState<unknown>>(new DataInitial());
  readonly busy = shallowRef(false);
  readonly refreshFailed = shallowRef(false);
  readonly completeSequence = shallowRef(false);
  readonly calculatedFinish = computed(() => {
    const groups = this.listState.value instanceof DataSuccess ? this.listState.value.data : null;
    return groups?.length
      ? (this.overviewState.value.data?.endDate ?? groups[groups.length - 1]?.finishDate)
      : undefined;
  });
  private constructor() {
    super();
  }
  static getInstance() {
    return (this.instance ??= new ScheduleController());
  }
  protected get repository() {
    return ScheduleRepository.getInstance();
  }

  protected captureMutationScope() {
    const epoch = this.epoch;
    return () => epoch === this.epoch;
  }
  // Base CRUD feedback belongs to the save state; keep the loaded Edit detail intact.
  setItemLoading() {
    if (this.busy.value) this.mutationState.value = new DataLoading();
    else super.setItemLoading();
  }
  setItemState(state: DataState<ScheduleGroupModel>) {
    if (this.busy.value) this.mutationState.value = state;
    else super.setItemState(state);
  }

  activate(quoteId: number, groupId: number | null = null) {
    if (!validId(quoteId) || (groupId !== null && !validId(groupId)))
      throw new Error('schedule.invalid_ids');
    if (this.owner === quoteId && this.group === groupId) return;
    if (this.owner !== quoteId) {
      this.epoch++;
      this.owner = quoteId;
      this.resetOwnerData();
    }
    if (this.group !== groupId) {
      this.epoch++;
      this.detailRequest++;
      this.projectExecutionBusy.value = false;
      this.projectExecutionState.value = new DataInitial();
      this.projectExecutionRefreshFailed.value = false;
      this.group = groupId;
      this.overviewPending = null;
      if (this.overviewState.value instanceof DataLoading)
        this.overviewState.value = new DataInitial();
    }
    this.busy.value = false;
    this.itemState.value = new DataInitial();
    this.mutationState.value = new DataInitial();
    this.refreshFailed.value = false;
  }
  invalidateRequests() {
    this.epoch++;
    this.projectExecutionBusy.value = false;
    this.projectExecutionState.value = new DataInitial();
    this.closeHistory();
    this.busy.value = false;
    this.overviewPending = null;
    if (this.overviewState.value instanceof DataLoading)
      this.overviewState.value = new DataInitial();
  }
  release() {
    this.epoch++;
    this.owner = null;
    this.group = null;
    this.busy.value = false;
    this.resetOwnerData();
    this.itemState.value = new DataInitial();
    this.mutationState.value = new DataInitial();
    this.refreshFailed.value = false;
  }
  private resetOwnerData() {
    this.overviewState.value = new DataInitial();
    this.overviewPending = null;
    this.listState.value = new DataInitial();
    this.settingsState.value = new DataInitial();
    this.projectExecutionState.value = new DataInitial();
    this.projectExecutionBusy.value = false;
    this.projectExecutionRefreshFailed.value = false;
    this.ownerState.value = new DataInitial();
    this.approvalState.value = new DataInitial();
    this.workStatusState.value = new DataInitial();
    this.closeHistory();
    this.lookups.value = new Map();
    this.childParents.clear();
    this.stageLabels.value = new Map();
    this.childLabels.value = new Map();
    this.completeSequence.value = false;
  }

  private scoped(params?: Params): params is ScheduleOwnerParams {
    return (
      params instanceof ScheduleOwnerParams &&
      params.quoteId === this.owner &&
      params.validate().isValid
    );
  }
  async readOwner() {
    const epoch = this.epoch;
    if (this.owner === null) return;
    this.ownerState.value = new DataLoading();
    const ownerState = await ExecutionQuoteRepository.getInstance().show(
      new ShowExecutionQuoteParams({ executionQuoteId: this.owner }),
      { useStaticData: false },
      false,
    );
    if (epoch !== this.epoch) return;
    this.ownerState.value =
      ownerState instanceof DataSuccess && ownerState.data?.id !== this.owner
        ? new DataFailed({ error: new ErrorModel('schedule.owner_error', ErrorType.dataDirty) })
        : ownerState;
  }
  async changeApproval(
    params: ChangeTimelineApprovalParams,
  ): Promise<DataState<ExecutionQuoteShowModel>> {
    if (
      params.quoteId !== this.owner ||
      this.busy.value ||
      !params.validate().isValid ||
      this.ownerState.value.data?.timelineStatus === params.timelineStatus
    )
      return new DataCancelled();
    const epoch = this.epoch;
    this.busy.value = true;
    this.refreshFailed.value = false;
    this.approvalState.value = new DataLoading();
    try {
      const result = await this.repository.changeApproval(params);
      if (epoch !== this.epoch) return new DataCancelled();
      this.approvalState.value = result;
      if (result instanceof DataSuccess && result.data) {
        this.ownerState.value = new DataSuccess({ data: result.data });
        const [, refreshed] = await Promise.all([
          this.readOwner(),
          this.fetchList(new ScheduleOwnerParams(params.quoteId)),
        ]);
        if (epoch !== this.epoch) return new DataCancelled();
        if (!(this.ownerState.value instanceof DataSuccess))
          this.ownerState.value = new DataSuccess({ data: result.data });
        this.refreshFailed.value = !(refreshed instanceof DataSuccess);
      }
      return result;
    } finally {
      if (epoch === this.epoch) this.busy.value = false;
    }
  }
  async changeWorkStatus(
    params: ChangeTimelineWorkStatusParams,
  ): Promise<DataState<ProjectTimelineWorkStatusModel>> {
    const groups = this.listState.value.data;
    const group = groups?.find((entry) => entry.id === params.projectTimelineId);
    if (
      this.owner === null ||
      this.busy.value ||
      !params.validate().isValid ||
      !group ||
      this.ownerState.value.data?.timelineStatus !== TimelineApprovalStatus.APPROVED ||
      group.workStatus === params.workStatus
    )
      return new DataCancelled();
    const owner = this.owner;
    const epoch = this.epoch;
    this.busy.value = true;
    this.refreshFailed.value = false;
    this.workStatusState.value = new DataLoading();
    try {
      const result = await this.repository.changeWorkStatus(params);
      if (epoch !== this.epoch) return new DataCancelled();
      if (
        result instanceof DataSuccess &&
        result.data &&
        (result.data.quoteId !== owner ||
          result.data.projectTimelineId !== params.projectTimelineId ||
          result.data.workStatus !== params.workStatus)
      ) {
        const invalid = new DataFailed<ProjectTimelineWorkStatusModel>({
          error: new ErrorModel('schedule.invalid_response', ErrorType.dataDirty),
        });
        this.workStatusState.value = invalid;
        return invalid;
      }
      this.workStatusState.value = result;
      if (result instanceof DataSuccess && result.data) {
        const current = this.listState.value.data ?? groups ?? [];
        this.listState.value = new DataSuccess({
          data: current.map((entry) =>
            entry.id === result.data?.projectTimelineId
              ? new ScheduleGroupModel({ ...entry, workStatus: result.data.workStatus })
              : entry,
          ),
          pagination: this.listState.value.pagination,
        });
        const refreshed = await this.fetchList(new ScheduleOwnerParams(owner));
        if (epoch !== this.epoch) return new DataCancelled();
        this.refreshFailed.value = !(refreshed instanceof DataSuccess);
      }
      return result;
    } finally {
      if (epoch === this.epoch) this.busy.value = false;
    }
  }
  async readHistory(groupId: number): Promise<DataState<ProjectTimelineHistoryModel[]>> {
    if (
      this.owner === null ||
      !validId(groupId) ||
      !this.listState.value.data?.some((group) => group.id === groupId)
    )
      return new DataCancelled();
    const owner = this.owner;
    const epoch = this.epoch;
    const request = ++this.historyRequest;
    this.historyGroupId.value = groupId;
    this.historyState.value = new DataLoading();
    const result = await this.repository.readHistory(new ScheduleOwnerParams(owner, groupId));
    if (
      epoch !== this.epoch ||
      request !== this.historyRequest ||
      this.historyGroupId.value !== groupId
    )
      return new DataCancelled();
    this.historyState.value =
      result instanceof DataSuccess &&
      result.data?.some((entry: ProjectTimelineHistoryModel) => entry.projectTimelineId !== groupId)
        ? new DataFailed({
            error: new ErrorModel('schedule.invalid_response', ErrorType.dataDirty),
          })
        : result;
    return this.historyState.value;
  }
  closeHistory() {
    this.historyRequest++;
    this.historyGroupId.value = null;
    this.historyState.value = new DataInitial();
  }
  async fetchList(params?: Params): Promise<DataState<ScheduleGroupModel[]>> {
    if (!this.scoped(params)) return new DataCancelled();
    const epoch = this.epoch;
    const request = ++this.listRequest;
    if (!this.busy.value) this.listState.value = new DataLoading();
    this.completeSequence.value = false;
    const overview = await this.readOverview(params.quoteId, this.busy.value);
    if (epoch !== this.epoch || request !== this.listRequest) return new DataCancelled();
    const listState: DataState<ScheduleGroupModel[]> =
      overview instanceof DataSuccess && overview.data
        ? new DataSuccess({ data: overview.data.projectTimelines, pagination: overview.pagination })
        : new DataFailed({ error: overview.error });
    if (listState instanceof DataSuccess || !this.busy.value) this.listState.value = listState;
    this.completeSequence.value =
      overview instanceof DataSuccess &&
      overview.data !== null &&
      overview.pagination === null &&
      overview.data.count === overview.data.projectTimelines.length;
    return listState;
  }
  async fetchOne(params: Params): Promise<DataState<ScheduleGroupModel>> {
    if (!this.scoped(params) || params.groupId !== this.group || !validId(params.groupId ?? 0))
      return new DataCancelled();
    const epoch = this.epoch;
    const request = ++this.detailRequest;
    this.itemState.value = new DataLoading();
    const detailState = await this.repository.show(params);
    if (epoch !== this.epoch || request !== this.detailRequest) return new DataCancelled();
    this.itemState.value =
      detailState instanceof DataSuccess && detailState.data?.id !== params.groupId
        ? new DataFailed({
            error: new ErrorModel('schedule.invalid_response', ErrorType.dataDirty),
          })
        : detailState;
    return this.itemState.value;
  }
  async readSettings(params: ScheduleOwnerParams) {
    if (!this.scoped(params)) return new DataCancelled<ScheduleSettingsModel>();
    const epoch = this.epoch;
    const request = ++this.settingsRequest;
    this.settingsState.value = new DataLoading();
    const settingsState = await this.repository.readSettings(params);
    if (epoch !== this.epoch || request !== this.settingsRequest)
      return new DataCancelled<ScheduleSettingsModel>();
    this.settingsState.value = settingsState;
    return settingsState;
  }
  clearProjectExecutionFeedback() {
    if (this.projectExecutionBusy.value) return;
    this.projectExecutionState.value = new DataInitial();
    this.projectExecutionRefreshFailed.value = false;
  }

  async changeProjectConfigurationWorkStatus(
    params: ChangeProjectConfigurationWorkStatusParams,
  ): Promise<DataState<ScheduleSettingsModel>> {
    const configuration =
      this.settingsState.value instanceof DataSuccess ? this.settingsState.value.data : null;
    if (params.quoteId !== this.owner || this.projectExecutionBusy.value)
      return new DataCancelled();
    if (
      !configuration ||
      !params.validate().isValid ||
      configuration.workStatus === undefined ||
      configuration.workStatus === params.workStatus ||
      (configuration.workStatus === null &&
        (params.workStatus !== ProjectWorkStatus.START ||
          !validId(params.responsibleEmployeeId ?? 0))) ||
      (params.workStatus === ProjectWorkStatus.START &&
        !validId(params.responsibleEmployeeId ?? configuration.responsibleEmployeeId ?? 0))
    ) {
      const failure = new DataFailed<ScheduleSettingsModel>({
        error: new ErrorModel('project_execution.invalid_transition', ErrorType.validation),
      });
      this.projectExecutionState.value = failure;
      return failure;
    }
    const epoch = this.epoch;
    // Invalidate an earlier configuration read before applying the returned mutation resource.
    this.settingsRequest++;
    this.projectExecutionBusy.value = true;
    this.projectExecutionRefreshFailed.value = false;
    this.projectExecutionState.value = new DataLoading();
    try {
      const result = await this.repository.changeProjectConfigurationWorkStatus(params);
      if (epoch !== this.epoch) return new DataCancelled();
      this.projectExecutionState.value = result;
      if (result instanceof DataSuccess && result.data) {
        this.settingsState.value = new DataSuccess({ data: result.data });
        const refreshed = await this.readSettings(new ScheduleOwnerParams(params.quoteId));
        if (epoch !== this.epoch) return new DataCancelled();
        this.projectExecutionRefreshFailed.value = !(refreshed instanceof DataSuccess);
        if (!(refreshed instanceof DataSuccess))
          this.settingsState.value = new DataSuccess({ data: result.data });
      }
      return result;
    } finally {
      if (epoch === this.epoch) this.projectExecutionBusy.value = false;
    }
  }

  async readOverview(
    quoteId: number,
    refresh = false,
  ): Promise<DataState<ProjectTimelineOverviewModel>> {
    if (quoteId !== this.owner) return new DataCancelled();
    if (!refresh && this.overviewPending) return this.overviewPending;
    if (!refresh && this.overviewState.value instanceof DataSuccess)
      return this.overviewState.value;
    const epoch = this.epoch;
    const request = ++this.overviewRequest;
    this.overviewState.value = new DataLoading();
    const pending = this.repository.readOverview(new ScheduleOwnerParams(quoteId)).then((state) => {
      if (epoch !== this.epoch || request !== this.overviewRequest)
        return new DataCancelled<ProjectTimelineOverviewModel>();
      this.overviewState.value = state;
      this.overviewPending = null;
      return state;
    });
    this.overviewPending = pending;
    return pending;
  }
  async lookup(parentId: number | null, page = 1) {
    if (this.owner === null || (parentId !== null && !validId(parentId)) || !validId(page)) return;
    const epoch = this.epoch;
    const request = (this.lookupRequests.get(parentId) ?? 0) + 1;
    this.lookupRequests.set(parentId, request);
    this.assignLookup(parentId, new DataLoading());
    if (!(this.ownerState.value instanceof DataSuccess)) await this.readOwner();
    if (epoch !== this.epoch || this.lookupRequests.get(parentId) !== request) return;
    const ownerState = this.ownerState.value;
    if (!(ownerState instanceof DataSuccess) || !ownerState.data) {
      this.assignLookup(
        parentId,
        new DataFailed({
          error: ownerState.error ?? new ErrorModel('schedule.lookup_error', ErrorType.dataDirty),
        }),
      );
      return;
    }
    const labels = new Map<number, TitleModel>();
    for (const association of ownerState.data.quoteStages) {
      if (association.id === undefined || !validId(association.id)) continue;
      if (parentId === null)
        labels.set(
          association.id,
          TitleModel.fromMap({ id: association.id, title: association.stage?.title ?? '' }),
        );
      else if (association.id === parentId) {
        for (const child of association.subStage ?? []) {
          if (child.id === undefined || !validId(child.id)) continue;
          labels.set(
            child.id,
            TitleModel.fromMap({ id: child.id, title: child.subStage?.title ?? '' }),
          );
          this.childParents.set(child.id, association.id);
        }
      }
    }
    if (parentId === null) this.stageLabels.value = new Map([...this.stageLabels.value, ...labels]);
    else this.childLabels.value = new Map([...this.childLabels.value, ...labels]);
    this.assignLookup(parentId, new DataSuccess({ data: [...labels.values()] }));
  }
  private assignLookup(parentId: number | null, lookupState: DataState<TitleModel[]>) {
    this.lookups.value = new Map(this.lookups.value).set(parentId, lookupState);
  }
  knownSelectionsValid(params: ScheduleGroupParams) {
    return params.stages.every((selection) =>
      selection.children.every(
        (childId) =>
          !this.childParents.has(childId) ||
          this.childParents.get(childId) === selection.quoteStageId,
      ),
    );
  }
  async create(params: Params) {
    if (
      !(params instanceof ScheduleGroupParams) ||
      params.groupId !== undefined ||
      !this.knownSelectionsValid(params)
    )
      return this.validationFailure<ScheduleGroupModel>();
    const epoch = this.startSave(params);
    if (epoch === null) return new DataCancelled<ScheduleGroupModel>();
    return this.finishSave(await super.create(params), params.quoteId, epoch);
  }
  async update(params?: Params) {
    if (this.timelineApproved.value) return new DataCancelled<ScheduleGroupModel>();
    if (
      !(params instanceof ScheduleGroupParams) ||
      params.groupId !== this.group ||
      !validId(params.groupId ?? 0) ||
      !this.knownSelectionsValid(params)
    )
      return this.validationFailure<ScheduleGroupModel>();
    const epoch = this.startSave(params);
    if (epoch === null) return new DataCancelled<ScheduleGroupModel>();
    return this.finishSave(await super.update(params), params.quoteId, epoch);
  }
  async delete(params?: Params) {
    if (
      this.timelineApproved.value ||
      !(params instanceof ScheduleOwnerParams) ||
      !validId(params.groupId ?? 0)
    )
      return new DataCancelled<void>();
    const epoch = this.startSave(params);
    if (epoch === null) return new DataCancelled<void>();
    return this.finishSave(await super.delete(params), params.quoteId, epoch);
  }
  async saveSettings(params: ScheduleSettingsParams) {
    const epoch = this.startSave(params);
    if (epoch === null) return new DataCancelled<void>();
    try {
      return await this.finishSave(
        await this.repository.saveSettings(params),
        params.quoteId,
        epoch,
        'settings',
      );
    } finally {
      if (epoch === this.epoch) this.busy.value = false;
    }
  }
  canMove(groupId: number, direction: -1 | 1) {
    const groups = this.listState.value.data;
    const position = groups?.findIndex((group) => group.id === groupId) ?? -1;
    return (
      this.completeSequence.value &&
      !this.timelineApproved.value &&
      !this.busy.value &&
      position >= 0 &&
      position + direction >= 0 &&
      position + direction < (groups?.length ?? 0)
    );
  }
  async changeProjectTimelineOrder(projectTimelineId: number, destinationOrder: number) {
    const groups = this.listState.value.data ?? [];
    if (
      this.owner === null ||
      this.timelineApproved.value ||
      !this.completeSequence.value ||
      this.busy.value ||
      !validId(projectTimelineId) ||
      !validId(destinationOrder) ||
      destinationOrder > groups.length ||
      groups.findIndex((timeline) => timeline.id === projectTimelineId) + 1 === destinationOrder ||
      !groups.some((timeline) => timeline.id === projectTimelineId)
    )
      return new DataCancelled<void>();
    const params = new ChangeProjectTimelineOrderParams(projectTimelineId, destinationOrder);
    // Scope locally; quote_id is absent from the reorder request body.
    const quoteId = this.owner;
    const epoch = this.startSave(new ScheduleOwnerParams(quoteId));
    if (epoch === null) return new DataCancelled<void>();
    try {
      return await this.finishSave(
        await this.repository.changeProjectTimelineOrder(params),
        quoteId,
        epoch,
      );
    } finally {
      if (epoch === this.epoch) this.busy.value = false;
    }
  }
  private validationFailure<T>(): DataState<T> {
    return new DataFailed({ error: new ErrorModel('schedule.invalid_form', ErrorType.validation) });
  }
  private startSave(params: ScheduleOwnerParams): number | null {
    if (!this.scoped(params) || this.busy.value) return null;
    this.busy.value = true;
    this.refreshFailed.value = false;
    this.mutationState.value = new DataLoading();
    return this.epoch;
  }
  private async finishSave<T>(
    state: DataState<T> | undefined,
    quoteId: number,
    epoch: number,
    resource: 'timeline' | 'settings' = 'timeline',
  ): Promise<DataState<T>> {
    if (epoch !== this.epoch) return new DataCancelled();
    const result = state ?? this.validationFailure<T>();
    this.mutationState.value = result;
    try {
      if (result instanceof DataSuccess) {
        const list = await this.fetchList(new ScheduleOwnerParams(quoteId));
        if (epoch !== this.epoch) return new DataCancelled();
        this.itemState.value = new DataInitial();
        this.refreshFailed.value = !(list instanceof DataSuccess);
        if (resource === 'settings') {
          const settings = await this.readSettings(new ScheduleOwnerParams(quoteId));
          if (epoch !== this.epoch) return new DataCancelled();
          this.refreshFailed.value ||= !(settings instanceof DataSuccess);
        }
      }
      return result;
    } finally {
      if (epoch === this.epoch) this.busy.value = false;
    }
  }
}
