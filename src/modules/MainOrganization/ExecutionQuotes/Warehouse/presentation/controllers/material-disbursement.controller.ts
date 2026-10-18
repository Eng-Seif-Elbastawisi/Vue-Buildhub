import { computed, reactive, shallowRef } from 'vue';
import BaseController from '@/base/Presentation/Controller/baseController';
import type Params from '@/base/Core/Params/params';
import type { ApiCallOptions } from '@/base/Data/ApiService/baseApiService';
import {
  DataCancelled,
  DataFailed,
  DataInitial,
  DataLoading,
  DataNoNetwork,
  DataRateLimited,
  DataSuccess,
  DataTimeout,
  type DataState,
} from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import { ErrorModel, ErrorType } from '@/base/Core/NetworkStructure/Resources/errors/errorModel';
import { validId } from '../../../Schedule/core/constants/schedule.constants';
import type DisbursementStockModel from '../../core/models/disbursement-stock.model';
import type PurchaseRequestDisbursementModel from '../../core/models/purchase-request-disbursement.model';
import FetchDisbursementStockParams from '../../core/params/fetch-disbursement-stock.params';
import FetchDisbursementsParams from '../../core/params/fetch-disbursements.params';
import StorePurchaseRequestDisbursementParams from '../../core/params/store-purchase-request-disbursement.params';
import { decimalCents } from '../../core/params/purchase-request-receipt-item.params';
import MaterialDisbursementRepository from '../../data/repositories/material-disbursement.repository';
import MaterialDisbursementHistoryRepository from '../../data/repositories/material-disbursement-history.repository';

export default class MaterialDisbursementController extends BaseController<
  void,
  DisbursementStockModel[]
> {
  private static instance: MaterialDisbursementController;
  private epoch = 0;
  private stockSequence = 0;
  private historySequence = 0;
  private uncertainQuotes = reactive(new Set<number>());

  readonly quoteId = shallowRef<number | null>(null);
  readonly historyState = shallowRef<DataState<PurchaseRequestDisbursementModel[]>>(
    new DataInitial(),
  );
  readonly mutationState = shallowRef<DataState<void>>(new DataInitial());
  readonly isStoring = shallowRef(false);
  readonly refreshFailed = shallowRef(false);
  readonly submissionUncertain = computed(
    () => this.quoteId.value !== null && this.uncertainQuotes.has(this.quoteId.value),
  );

  private constructor() {
    super();
  }

  static getInstance() {
    return (this.instance ??= new MaterialDisbursementController());
  }

  protected get repository() {
    return MaterialDisbursementRepository.getInstance();
  }

  protected get config() {
    return { autoRetry: false, showSuccessTosat: false, showErrorTosat: false };
  }

  protected handleItemResponse() {
    return;
  }

  protected captureMutationScope() {
    const epoch = this.epoch;
    const quoteId = this.quoteId.value;
    return () => epoch === this.epoch && quoteId === this.quoteId.value;
  }

  private invalid<T>() {
    return new DataFailed<T>({
      error: new ErrorModel('material_disbursement.invalid_response', ErrorType.dataDirty),
    });
  }

  activate(quoteId: number) {
    this.release();
    if (validId(quoteId)) this.quoteId.value = quoteId;
  }

  release() {
    if (this.isStoring.value && this.quoteId.value) this.uncertainQuotes.add(this.quoteId.value);
    this.epoch++;
    this.stockSequence++;
    this.historySequence++;
    this.quoteId.value = null;
    this.listState.value = new DataInitial();
    this.historyState.value = new DataInitial();
    this.mutationState.value = new DataInitial();
    this.refreshFailed.value = false;
  }

  async load() {
    await Promise.all([this.loadStock(), this.loadHistory()]);
  }

  async loadStock() {
    const quoteId = this.quoteId.value;
    if (!quoteId) return new DataCancelled<DisbursementStockModel[]>();
    const epoch = this.epoch;
    const sequence = ++this.stockSequence;
    this.listState.value = new DataLoading();
    const result = await this.repository.index(new FetchDisbursementStockParams(quoteId));
    if (epoch !== this.epoch || sequence !== this.stockSequence || quoteId !== this.quoteId.value)
      return new DataCancelled<DisbursementStockModel[]>();
    const ids = result.data?.map((item) => item.purchaseRequestItem.id) ?? [];
    this.listState.value = new Set(ids).size !== ids.length ? this.invalid() : result;
    return this.listState.value;
  }

  async loadHistory() {
    const quoteId = this.quoteId.value;
    if (!quoteId) return new DataCancelled<PurchaseRequestDisbursementModel[]>();
    const epoch = this.epoch;
    const sequence = ++this.historySequence;
    this.historyState.value = new DataLoading();
    const result = await MaterialDisbursementHistoryRepository.getInstance().show(
      new FetchDisbursementsParams(quoteId),
    );
    if (epoch !== this.epoch || sequence !== this.historySequence || quoteId !== this.quoteId.value)
      return new DataCancelled<PurchaseRequestDisbursementModel[]>();
    this.historyState.value = result.data?.some((entry) => entry.quoteId !== quoteId)
      ? this.invalid()
      : result;
    return this.historyState.value;
  }

  async create(params: Params, options?: ApiCallOptions) {
    if (
      this.isStoring.value ||
      this.refreshFailed.value ||
      this.submissionUncertain.value ||
      !(params instanceof StorePurchaseRequestDisbursementParams) ||
      params.quoteId !== this.quoteId.value ||
      !(this.listState.value instanceof DataSuccess)
    )
      return new DataCancelled<void>();

    const stock: DisbursementStockModel[] = this.listState.value.data ?? [];
    if (
      !params.validate().isValid ||
      params.items.some((item) => {
        const row = stock.find(
          (entry) => entry.purchaseRequestItem.id === item.purchaseRequestItemId,
        );
        return (
          !row?.canIssue ||
          (decimalCents(item.quantity) ?? Infinity) > (decimalCents(row.availableQuantity) ?? -1)
        );
      })
    ) {
      this.mutationState.value = new DataFailed({
        error: new ErrorModel('material_disbursement.invalid_quantity', ErrorType.validation),
      });
      return this.mutationState.value;
    }

    const current = this.captureMutationScope();
    const quoteId = params.quoteId;
    this.isStoring.value = true;
    this.refreshFailed.value = false;
    this.mutationState.value = new DataLoading();
    try {
      const saved = await super.create(params, options);
      if (
        saved instanceof DataTimeout ||
        saved instanceof DataNoNetwork ||
        saved instanceof DataRateLimited ||
        (saved instanceof DataFailed &&
          saved.error?.title === 'material_disbursement.unconfirmed_store')
      )
        this.uncertainQuotes.add(quoteId);
      if (!current()) return new DataCancelled<void>();
      if (saved) this.mutationState.value = saved;
      if (saved instanceof DataSuccess) {
        const [stockResult, historyResult] = await Promise.all([
          this.loadStock(),
          this.loadHistory(),
        ]);
        if (!current()) return new DataCancelled<void>();
        this.refreshFailed.value = !(
          stockResult instanceof DataSuccess && historyResult instanceof DataSuccess
        );
      } else if (saved instanceof DataFailed && !this.submissionUncertain.value) {
        // A rejected issue may reflect stock changed by another employee.
        await this.loadStock();
      }
      return saved;
    } finally {
      this.isStoring.value = false;
    }
  }

  async retryRefresh() {
    const current = this.captureMutationScope();
    const [stockResult, historyResult] = await Promise.all([this.loadStock(), this.loadHistory()]);
    if (!current()) return false;
    this.refreshFailed.value = !(
      stockResult instanceof DataSuccess && historyResult instanceof DataSuccess
    );
    return !this.refreshFailed.value;
  }

  clearMutation() {
    if (!this.isStoring.value && !this.refreshFailed.value && !this.submissionUncertain.value)
      this.mutationState.value = new DataInitial();
  }
}
