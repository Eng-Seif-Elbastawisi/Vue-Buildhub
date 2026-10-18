import { computed, reactive, shallowRef } from 'vue';
import BaseController from '@/base/Presentation/Controller/baseController';
import type Params from '@/base/Core/Params/params';
import type { ApiCallOptions } from '@/base/Data/ApiService/baseApiService';
import {
  DataInitial,
  DataLoading,
  DataSuccess,
  DataFailed,
  DataCancelled,
  DataTimeout,
  DataNoNetwork,
  DataRateLimited,
  type DataState,
} from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import { ErrorModel, ErrorType } from '@/base/Core/NetworkStructure/Resources/errors/errorModel';
import PurchaseRequestRepository from '../../../Procurement/data/repositories/purchase-request.repository';
import PurchaseOrderRepository from '../../../Procurement/data/repositories/purchase.order.repository';
import FetchPurchaseOrderParams from '../../../Procurement/core/params/fetch.purchase.order.params';
import type PurchaseOrderModel from '../../../Procurement/core/models/purchase.order.model';
import type PurchaseRequestModel from '../../../Procurement/core/models/purchase-request.model';
import FetchPurchaseRequestsParams from '../../../Procurement/core/params/fetch.purchase-requests.params';
import MaterialReceiptRepository from '../../data/repositories/material-receipt.repository';
import MaterialReceiptHistoryRepository from '../../data/repositories/material-receipt-history.repository';
import type PurchaseRequestReceiptItemSummaryModel from '../../core/models/purchase-request-receipt-item-summary.model';
import type PurchaseRequestReceiptModel from '../../core/models/purchase-request-receipt.model';
import FetchPurchaseRequestReceiptsParams from '../../core/params/fetch-purchase-request-receipts.params';
import FetchPurchaseRequestReceiptsHistoryParams from '../../core/params/fetch-purchase-request-receipts-history.params';
import StorePurchaseRequestReceiptParams from '../../core/params/store-purchase-request-receipt.params';
import { decimalCents } from '../../core/params/purchase-request-receipt-item.params';
import { validId } from '../../../Schedule/core/constants/schedule.constants';

export default class MaterialReceiptController extends BaseController<
  void,
  PurchaseRequestReceiptItemSummaryModel[]
> {
  private static instance: MaterialReceiptController;
  private epoch = 0;
  private requestSequence = 0;
  private summarySequence = 0;
  private historySequence = 0;
  private orderSequence = 0;
  private uncertainOwners = reactive(new Set<string>());
  readonly quoteId = shallowRef<number | null>(null);
  readonly purchaseRequestId = shallowRef<number | null>(null);
  readonly requestsState = shallowRef<DataState<PurchaseRequestModel[]>>(new DataInitial());
  readonly historyState = shallowRef<DataState<PurchaseRequestReceiptModel[]>>(new DataInitial());
  readonly mutationState = shallowRef<DataState<void>>(new DataInitial());
  readonly orderState = shallowRef<DataState<PurchaseOrderModel | null>>(new DataInitial());
  readonly isStoring = shallowRef(false);
  readonly refreshFailed = shallowRef(false);
  readonly submissionUncertain = computed(() =>
    this.uncertainOwners.has(`${this.quoteId.value}:${this.purchaseRequestId.value}`),
  );
  readonly selectedRequest = computed(() =>
    this.requestsState.value.data?.find(
      (request) =>
        request.id === this.purchaseRequestId.value && request.quoteId === this.quoteId.value,
    ),
  );
  readonly visibleHistory = computed(() =>
    (this.historyState.value.data ?? []).filter(
      (receipt) =>
        this.purchaseRequestId.value === null ||
        receipt.purchaseRequestId === this.purchaseRequestId.value,
    ),
  );
  private constructor() {
    super();
  }
  static getInstance() {
    return (this.instance ??= new MaterialReceiptController());
  }
  protected get repository() {
    return MaterialReceiptRepository.getInstance();
  }
  protected get config() {
    return { autoRetry: false, showSuccessTosat: false, showErrorTosat: false };
  }
  protected handleItemResponse() {
    return;
  }
  protected captureMutationScope() {
    const epoch = this.epoch;
    const requestId = this.purchaseRequestId.value;
    return () => epoch === this.epoch && requestId === this.purchaseRequestId.value;
  }
  private invalid<T>() {
    return new DataFailed<T>({
      error: new ErrorModel('material_receipt.invalid_response', ErrorType.dataDirty),
    });
  }
  activate(quoteId: number) {
    this.release();
    if (validId(quoteId)) this.quoteId.value = quoteId;
  }
  release() {
    if (this.isStoring.value && this.quoteId.value && this.purchaseRequestId.value)
      this.uncertainOwners.add(`${this.quoteId.value}:${this.purchaseRequestId.value}`);
    this.epoch++;
    this.requestSequence++;
    this.summarySequence++;
    this.historySequence++;
    this.orderSequence++;
    this.quoteId.value = null;
    this.purchaseRequestId.value = null;
    this.requestsState.value = new DataInitial();
    this.listState.value = new DataInitial();
    this.historyState.value = new DataInitial();
    this.mutationState.value = new DataInitial();
    this.orderState.value = new DataInitial();
    this.refreshFailed.value = false;
  }
  async load() {
    await Promise.all([this.loadRequests(), this.loadHistory()]);
  }
  async loadRequests() {
    const quoteId = this.quoteId.value;
    if (!quoteId) return new DataCancelled<PurchaseRequestModel[]>();
    const epoch = this.epoch;
    const sequence = ++this.requestSequence;
    this.requestsState.value = new DataLoading();
    const result = await PurchaseRequestRepository.getInstance().index(
      new FetchPurchaseRequestsParams(quoteId),
    );
    if (epoch !== this.epoch || sequence !== this.requestSequence)
      return new DataCancelled<PurchaseRequestModel[]>();
    this.requestsState.value = result.data?.some((request) => request.quoteId !== quoteId)
      ? this.invalid()
      : result;
    if (this.purchaseRequestId.value && !this.selectedRequest.value) this.selectRequest(null);
    return this.requestsState.value;
  }
  selectRequest(id: number | null) {
    if (this.isStoring.value) return;
    this.summarySequence++;
    this.orderSequence++;
    this.purchaseRequestId.value =
      id &&
      this.requestsState.value.data?.some(
        (request) => request.id === id && request.quoteId === this.quoteId.value,
      )
        ? id
        : null;
    this.listState.value = new DataInitial();
    this.orderState.value = new DataInitial();
    this.mutationState.value = new DataInitial();
    this.refreshFailed.value = false;
    if (this.purchaseRequestId.value) {
      void this.loadSummary();
      void this.loadOrder();
    }
  }
  async loadOrder() {
    const id = this.purchaseRequestId.value;
    if (!id || !this.selectedRequest.value) return new DataCancelled<PurchaseOrderModel | null>();
    const epoch = this.epoch;
    const sequence = ++this.orderSequence;
    this.orderState.value = new DataLoading();
    const result = await PurchaseOrderRepository.getInstance().show(
      new FetchPurchaseOrderParams(id),
    );
    if (
      epoch !== this.epoch ||
      sequence !== this.orderSequence ||
      id !== this.purchaseRequestId.value
    )
      return new DataCancelled<PurchaseOrderModel | null>();
    const order = result.data;
    this.orderState.value =
      order &&
      (order.purchaseRequest.id !== id || order.purchaseRequest.quoteId !== this.quoteId.value)
        ? this.invalid()
        : result;
    return this.orderState.value;
  }
  async loadSummary() {
    const id = this.purchaseRequestId.value;
    const request = this.selectedRequest.value;
    if (!id || !request) return new DataCancelled<PurchaseRequestReceiptItemSummaryModel[]>();
    const epoch = this.epoch;
    const sequence = ++this.summarySequence;
    this.listState.value = new DataLoading();
    const result = await this.repository.index(new FetchPurchaseRequestReceiptsParams(id));
    if (
      epoch !== this.epoch ||
      sequence !== this.summarySequence ||
      id !== this.purchaseRequestId.value
    )
      return new DataCancelled<PurchaseRequestReceiptItemSummaryModel[]>();
    const knownIds = new Set(request.items.map((item) => item.id));
    this.listState.value = result.data?.some(
      (summary) => !knownIds.has(summary.purchaseRequestItem.id),
    )
      ? this.invalid()
      : result;
    return this.listState.value;
  }
  async loadHistory() {
    const quoteId = this.quoteId.value;
    if (!quoteId) return new DataCancelled<PurchaseRequestReceiptModel[]>();
    const epoch = this.epoch;
    const sequence = ++this.historySequence;
    this.historyState.value = new DataLoading();
    const result = await MaterialReceiptHistoryRepository.getInstance().show(
      new FetchPurchaseRequestReceiptsHistoryParams(quoteId),
    );
    if (epoch !== this.epoch || sequence !== this.historySequence || quoteId !== this.quoteId.value)
      return new DataCancelled<PurchaseRequestReceiptModel[]>();
    this.historyState.value = result.data?.some((receipt) => receipt.quoteId !== quoteId)
      ? this.invalid()
      : result;
    return this.historyState.value;
  }
  async create(params: Params, options?: ApiCallOptions) {
    if (
      this.isStoring.value ||
      this.refreshFailed.value ||
      this.submissionUncertain.value ||
      !(params instanceof StorePurchaseRequestReceiptParams) ||
      params.purchaseRequestId !== this.purchaseRequestId.value ||
      !this.selectedRequest.value ||
      !(this.listState.value instanceof DataSuccess) ||
      this.orderState.value.data?.status !== 3
    )
      return new DataCancelled<void>();
    const summaries: PurchaseRequestReceiptItemSummaryModel[] = this.listState.value.data ?? [];
    if (
      !params.validate().isValid ||
      params.items.some((item) => {
        const summary = summaries.find(
          (entry) => entry.purchaseRequestItem.id === item.purchaseRequestItemId,
        );
        return (
          !summary?.canReceive ||
          (decimalCents(item.quantity) ?? Infinity) >
            (decimalCents(summary.remainingQuantity) ?? -1)
        );
      })
    ) {
      this.mutationState.value = new DataFailed({
        error: new ErrorModel('material_receipt.invalid_quantity', ErrorType.validation),
      });
      return this.mutationState.value;
    }
    const current = this.captureMutationScope();
    const ownerKey = `${this.quoteId.value}:${params.purchaseRequestId}`;
    this.isStoring.value = true;
    this.refreshFailed.value = false;
    try {
      const saved = await super.create(params, options);
      if (
        saved instanceof DataTimeout ||
        saved instanceof DataNoNetwork ||
        saved instanceof DataRateLimited ||
        (saved instanceof DataFailed && saved.error?.title === 'material_receipt.unconfirmed_store')
      )
        this.uncertainOwners.add(ownerKey);
      if (!current()) return new DataCancelled<void>();
      if (saved) this.mutationState.value = saved;
      if (saved instanceof DataSuccess) {
        const [summary, history] = await Promise.all([this.loadSummary(), this.loadHistory()]);
        if (!current()) return new DataCancelled<void>();
        this.refreshFailed.value = !(
          summary instanceof DataSuccess && history instanceof DataSuccess
        );
      }
      return saved;
    } finally {
      this.isStoring.value = false;
    }
  }
  async retryLastOperation() {
    return this.loadSummary();
  }
  async retryRefresh() {
    const current = this.captureMutationScope();
    const [summary, history] = await Promise.all([this.loadSummary(), this.loadHistory()]);
    if (!current()) return false;
    this.refreshFailed.value = !(summary instanceof DataSuccess && history instanceof DataSuccess);
    return !this.refreshFailed.value;
  }
}
