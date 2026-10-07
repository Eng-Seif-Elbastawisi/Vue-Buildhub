import { computed, shallowRef } from 'vue';
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
import type ScheduleGroupModel from '../../core/models/schedule.group.model';
import type ScheduleSettingsModel from '../../core/models/schedule.settings.model';
import ScheduleOwnerParams from '../../core/params/schedule.owner.params';
import ScheduleGroupParams from '../../core/params/schedule.group.params';
import type ScheduleSettingsParams from '../../core/params/schedule.settings.params';
import { validId } from '../../core/constants/schedule.constants';
import ScheduleRepository from '../../data/repositories/schedule.repository';

export default class ScheduleController extends BaseController<ScheduleGroupModel> {
  private static instance: ScheduleController;
  private epoch = 0;
  private listRequest = 0;
  private detailRequest = 0;
  private settingsRequest = 0;
  private lookupRequests = new Map<number | null, number>();
  private childParents = new Map<number, number>();
  private overviewRequest = 0;
  private overviewPending: Promise<DataState<ProjectTimelineOverviewModel>> | null = null;
  readonly overviewState = shallowRef<DataState<ProjectTimelineOverviewModel>>(new DataInitial());
  private owner: number | null = null;
  private group: number | null = null;
  readonly settingsState = shallowRef<DataState<ScheduleSettingsModel>>(new DataInitial());
  readonly ownerState = shallowRef<DataState<ExecutionQuoteShowModel>>(new DataInitial());
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
    this.ownerState.value = new DataInitial();
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
          const subStage = child.subStage;
          if (subStage?.id === undefined || !validId(subStage.id)) continue;
          labels.set(
            subStage.id,
            TitleModel.fromMap({ id: subStage.id, title: subStage.title ?? '' }),
          );
          this.childParents.set(subStage.id, association.id);
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
    return this.mutate(params, () => this.repository.create(params));
  }
  async update(params?: Params) {
    if (
      !(params instanceof ScheduleGroupParams) ||
      params.groupId !== this.group ||
      !validId(params.groupId ?? 0) ||
      !this.knownSelectionsValid(params)
    )
      return this.validationFailure<ScheduleGroupModel>();
    return this.mutate(params, () => this.repository.update(params));
  }
  async delete(params?: Params) {
    if (!(params instanceof ScheduleOwnerParams) || !validId(params.groupId ?? 0))
      return new DataCancelled<void>();
    return this.mutate(params, () => this.repository.delete(params));
  }
  async saveSettings(params: ScheduleSettingsParams) {
    const epoch = this.epoch;
    return this.mutate(
      params,
      () => this.repository.saveSettings(params),
      () => this.refreshAfterMutation(params.quoteId, epoch),
    );
  }
  canMove(groupId: number, direction: -1 | 1) {
    const groups = this.listState.value.data;
    const position = groups?.findIndex((group) => group.id === groupId) ?? -1;
    return (
      this.completeSequence.value &&
      !this.busy.value &&
      position >= 0 &&
      position + direction >= 0 &&
      position + direction < (groups?.length ?? 0)
    );
  }
  async move(groupId: number, direction: -1 | 1) {
    if (!this.canMove(groupId, direction)) return new DataCancelled<void>();
    const position = (this.listState.value.data ?? []).findIndex((group) => group.id === groupId);
    return this.changeProjectTimelineOrder(groupId, position + direction + 1);
  }
  async changeProjectTimelineOrder(projectTimelineId: number, destinationOrder: number) {
    const groups = this.listState.value.data ?? [];
    if (
      this.owner === null ||
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
    // The owner scopes the request lifecycle but is deliberately absent from its wire body.
    return this.mutate(new ScheduleOwnerParams(this.owner), () =>
      this.repository.changeProjectTimelineOrder(params),
    );
  }
  private validationFailure<T>(): DataState<T> {
    return new DataFailed({ error: new ErrorModel('schedule.invalid_form', ErrorType.validation) });
  }
  private async mutate<T>(
    params: ScheduleOwnerParams,
    request: () => Promise<DataState<T>>,
    refresh?: () => Promise<void>,
  ): Promise<DataState<T>> {
    if (!this.scoped(params) || this.busy.value) return new DataCancelled();
    if (!params.validate().isValid) return this.validationFailure();
    const epoch = this.epoch;
    this.busy.value = true;
    this.refreshFailed.value = false;
    this.mutationState.value = new DataLoading();
    try {
      const mutationState = await request();
      if (epoch !== this.epoch) return new DataCancelled();
      this.mutationState.value = mutationState;
      if (mutationState instanceof DataSuccess) {
        if (refresh) await refresh();
        else await this.refreshOrder(params.quoteId, epoch);
      }
      return epoch === this.epoch ? mutationState : new DataCancelled();
    } finally {
      if (epoch === this.epoch) this.busy.value = false;
    }
  }
  private async refreshOrder(quoteId: number, epoch: number) {
    this.itemState.value = new DataInitial();
    const state = await this.fetchList(new ScheduleOwnerParams(quoteId));
    if (epoch === this.epoch) this.refreshFailed.value = !(state instanceof DataSuccess);
  }
  private async refreshAfterMutation(quoteId: number, epoch: number) {
    this.itemState.value = new DataInitial();
    const refreshStates = await Promise.all([
      this.fetchList(new ScheduleOwnerParams(quoteId)),
      this.readSettings(new ScheduleOwnerParams(quoteId)),
    ]);
    if (epoch === this.epoch)
      this.refreshFailed.value = refreshStates.some((state) => !(state instanceof DataSuccess));
  }
}
