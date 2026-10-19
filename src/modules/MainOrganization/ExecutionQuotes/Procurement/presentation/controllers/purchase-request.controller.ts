import { computed, shallowRef } from 'vue';
import BaseController from '@/base/Presentation/Controller/baseController';
import type Params from '@/base/Core/Params/params';
import TitleInterface from '@/base/Data/Models/titleInterface';
import {
  DataInitial,
  DataLoading,
  DataSuccess,
  DataEmpty,
  DataFailed,
  DataCancelled,
  type DataState,
} from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import { ErrorModel, ErrorType } from '@/base/Core/NetworkStructure/Resources/errors/errorModel';
import type { ApiCallOptions } from '@/base/Data/ApiService/baseApiService';
import EmployeeRepository from '@/modules/MainOrganization/employee/data/repositories/employee.repository';
import MaterialRepository from '@/modules/shared/Materials/data/repositories/materials.repository';
import ProductsRepository from '@/modules/MainOrganization/Products/data/repositories/products.repository';
import ProjectFloorRepository from '@/modules/MainOrganization/ProjectFloor/data/repositories/project.floor.repository';
import IndexProjectFloorParams from '@/modules/MainOrganization/ProjectFloor/core/params/index.project.floor.params';
import type ProjectFloorModel from '@/modules/MainOrganization/ProjectFloor/core/models/project.floor.model';
import ExecutionQuoteRepository from '../../../data/repositories/execution.quote.repository';
import ShowExecutionQuoteParams from '../../../core/params/show.execution.quote.params';
import type ExecutionQuoteShowModel from '../../../core/models/execution.quote.show.model';
import ScheduleRepository from '../../../Schedule/data/repositories/schedule.repository';
import { TimelineWorkStatus } from '../../../Schedule/core/constants/timeline.status';
import type ScheduleGroupModel from '../../../Schedule/core/models/schedule.group.model';
import { validId } from '../../../Schedule/core/constants/schedule.constants';
import PurchaseRequestRepository from '../../data/repositories/purchase-request.repository';
import type PurchaseRequestModel from '../../core/models/purchase-request.model';
import FetchPurchaseRequestsParams from '../../core/params/fetch.purchase-requests.params';
import StorePurchaseRequestParams from '../../core/params/store.purchase-request.params';

const readOptions = { useStaticData: false, enableRetry: false, useJson: true };
export default class PurchaseRequestController extends BaseController<
  void,
  PurchaseRequestModel[]
> {
  private static instance: PurchaseRequestController;
  private epoch = 0;
  private requests = new Map<string, number>();
  readonly quoteId = shallowRef<number | null>(null);
  readonly isStoring = shallowRef(false);
  readonly ownerState = shallowRef<DataState<ExecutionQuoteShowModel>>(new DataInitial());
  readonly stagesState = shallowRef<DataState<ScheduleGroupModel[]>>(new DataInitial());
  readonly floorsState = shallowRef<DataState<ProjectFloorModel[]>>(new DataInitial());
  readonly projectId = computed(() => this.ownerState.value.data?.project?.id);
  readonly mainStages = computed(() =>
    (this.stagesState.value.data ?? [])
      .filter((group) => group.workStatus === TimelineWorkStatus.START)
      .flatMap((group) =>
        group.stages
          .map(
            (stage) =>
              new TitleInterface({ id: stage.id, title: `${group.title} · ${stage.title}` }),
          ),
      ),
  );
  private constructor() {
    super();
  }
  static getInstance() {
    return (this.instance ??= new PurchaseRequestController());
  }
  protected get repository() {
    return PurchaseRequestRepository.getInstance();
  }
  protected get config() {
    return { autoRetry: false, showSuccessTosat: true, showErrorTosat: false };
  }
  // Feedback follows the owner-safe refresh rather than BaseController's generic create message.
  protected handleItemResponse() {
    return;
  }
  activate(quoteId: number) {
    this.release();
    if (validId(quoteId)) this.quoteId.value = quoteId;
  }
  release() {
    this.epoch++;
    this.requests.clear();
    this.quoteId.value = null;
    this.listState.value = new DataInitial();
    this.itemState.value = new DataInitial();
    this.ownerState.value = new DataInitial();
    this.stagesState.value = new DataInitial();
    this.floorsState.value = new DataInitial();
  }
  protected captureMutationScope() {
    const epoch = this.epoch;
    return () => epoch === this.epoch;
  }
  private requestScope(key: string) {
    const epoch = this.epoch;
    const sequence = (this.requests.get(key) ?? 0) + 1;
    this.requests.set(key, sequence);
    return () => epoch === this.epoch && sequence === this.requests.get(key);
  }
  private invalid<T>(key = 'procurement.invalid_form') {
    return new DataFailed<T>({ error: new ErrorModel(key, ErrorType.validation) });
  }
  async load() {
    await Promise.all([this.fetchList(), this.loadOwner(), this.loadStages()]);
  }
  // Base fetchList assigns state before a scoped owner can reject a late response.
  async fetchList(
    params?: Params,
    options?: ApiCallOptions,
  ): Promise<DataState<PurchaseRequestModel[]>> {
    const quoteId = this.quoteId.value;
    if (
      !quoteId ||
      (params && (!(params instanceof FetchPurchaseRequestsParams) || params.quoteId !== quoteId))
    )
      return new DataCancelled();
    const current = this.requestScope('list');
    this.setListLoading();
    const requests = await this.repository.index(new FetchPurchaseRequestsParams(quoteId), options);
    if (!current()) return new DataCancelled();
    this.listState.value = requests.data?.some((request) => request.quoteId !== quoteId)
      ? this.invalid('procurement.invalid_response')
      : requests;
    return this.listState.value;
  }
  async loadOwner() {
    if (!this.quoteId.value) return;
    const current = this.requestScope('owner');
    this.ownerState.value = new DataLoading();
    this.floorsState.value = new DataInitial();
    const owner = await ExecutionQuoteRepository.getInstance().show(
      new ShowExecutionQuoteParams({ executionQuoteId: this.quoteId.value }),
      readOptions,
      false,
    );
    if (!current()) return;
    this.ownerState.value =
      owner.data?.id !== undefined && owner.data.id !== this.quoteId.value
        ? this.invalid('procurement.invalid_response')
        : owner;
    if (this.ownerState.value instanceof DataSuccess) await this.loadFloors();
  }
  async loadStages() {
    if (!this.quoteId.value) return;
    const current = this.requestScope('stages');
    this.stagesState.value = new DataLoading();
    const overview = await ScheduleRepository.getInstance().fetchStartedProjectTimelines(
      this.quoteId.value,
    );
    if (!current()) return;
    this.stagesState.value =
      overview instanceof DataSuccess && overview.data
        ? new DataSuccess({ data: overview.data.projectTimelines })
        : new DataFailed({ error: overview.error });
  }
  async loadFloors() {
    const projectId = Number(this.projectId.value);
    if (!validId(projectId)) return;
    const current = this.requestScope('floors');
    this.floorsState.value = new DataLoading();
    const floors = await ProjectFloorRepository.getInstance().index(
      new IndexProjectFloorParams('', 1, 10, 0, undefined, projectId),
      readOptions,
      false,
    );
    if (!current() || this.projectId.value !== projectId) return;
    this.floorsState.value = floors.data?.some((floor) => {
      const ownerId = floor.project?.id ?? floor.project_id;
      return ownerId !== undefined && ownerId !== projectId;
    })
      ? this.invalid('procurement.floor_ownership_error')
      : floors;
  }
  createLookup(kind: 'employee' | 'material' | 'product') {
    const state = shallowRef<DataState<TitleInterface<string | number>[]>>(new DataInitial());
    let sequence = 0;
    return {
      state,
      pagination: computed(() => state.value.pagination),
      isListFailed: () => state.value.hasError && !(state.value instanceof DataEmpty),
      isListSuccess: () => state.value instanceof DataSuccess || state.value instanceof DataEmpty,
      fetchAsOptions: async (params?: Params): Promise<TitleInterface<string | number>[]> => {
        if (!this.quoteId.value) return [];
        const current = this.captureMutationScope();
        const request = ++sequence;
        state.value = new DataLoading();
        const lookup = await (kind === 'employee'
          ? EmployeeRepository.getInstance().index(params, readOptions, false)
          : kind === 'material'
            ? MaterialRepository.getInstance().index(params, readOptions, false)
            : ProductsRepository.getInstance().index(params, readOptions, false));
        if (!current() || request !== sequence) return [];
        const options = (lookup.data ?? [])
          .filter((record) => validId(Number(record.id)))
          .map(
            (record) =>
              new TitleInterface({
                id: Number(record.id),
                title: 'name' in record ? record.name : record.title,
              }),
          );
        state.value =
          lookup instanceof DataSuccess || lookup instanceof DataEmpty
            ? new DataSuccess({ data: options, pagination: lookup.pagination })
            : new DataFailed({ error: lookup.error });
        return options;
      },
    };
  }
  private validSelection(params: StorePurchaseRequestParams) {
    return (
      params.validate().isValid &&
      params.items.every((item) =>
        this.mainStages.value.some((stage) => stage.id === item.projectTimelineStageId),
      ) &&
      (params.isAllProject ||
        this.floorsState.value.data?.some((floor) =>
          floor.spaces.some((space) => space.id === params.projectFloorSpaceId),
        ) === true)
    );
  }
  async create(params: Params, options?: ApiCallOptions) {
    if (
      this.isStoring.value ||
      !(params instanceof StorePurchaseRequestParams) ||
      params.quoteId !== this.quoteId.value
    )
      return new DataCancelled<void>();
    if (!this.validSelection(params)) {
      this.itemState.value = this.invalid();
      return this.itemState.value;
    }
    const current = this.captureMutationScope();
    this.isStoring.value = true;
    try {
      await this.loadStages();
      if (!current()) return new DataCancelled<void>();
      if (!this.validSelection(params)) {
        this.itemState.value = this.invalid();
        return this.itemState.value;
      }
      const saved = await super.create(params, options);
      if (!current()) return new DataCancelled<void>();
      if (saved instanceof DataSuccess) {
        await this.fetchList();
        if (!current()) return new DataCancelled<void>();
        this.showSuccessToast('procurement.created');
      }
      return saved;
    } finally {
      this.isStoring.value = false;
    }
  }
  // Only idempotent reads can be retried from this workspace.
  async retryLastOperation() {
    return this.fetchList();
  }
}
