import { computed, shallowRef } from 'vue';
import BaseController from '@/base/Presentation/Controller/baseController';
import type Params from '@/base/Core/Params/params';
import type { ApiCallOptions } from '@/base/Data/ApiService/baseApiService';
import {
  DataInitial,
  DataLoading,
  DataSuccess,
  DataFailed,
  DataCancelled,
  type DataState,
} from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import { ErrorModel, ErrorType } from '@/base/Core/NetworkStructure/Resources/errors/errorModel';
import PurchaseOrderRepository from '../../data/repositories/purchase.order.repository';
import PurchaseRequestPricesRepository from '../../data/repositories/purchase-request-prices.repository';
import type PurchaseOrderModel from '../../core/models/purchase.order.model';
import type PurchaseRequestPriceModel from '../../core/models/purchase-request.price.model';
import FetchPurchaseOrderParams from '../../core/params/fetch.purchase.order.params';
import FetchPurchaseRequestPricesParams from '../../core/params/fetch.purchase-request-prices.params';
import StorePurchaseOrderParams from '../../core/params/store.purchase.order.params';
import PurchaseRequestController from './purchase-request.controller';

export default class PurchaseOrderController extends BaseController<PurchaseOrderModel | null> {
  private static instance: PurchaseOrderController;
  private epoch = 0;
  private fetchSequence = 0;
  private offersSequence = 0;
  private readonly quoteId = shallowRef<number | null>(null);
  // Successful or uncertain mutations stay blocked across dialog and owner switches.
  private blocked = new Set<string>();
  readonly purchaseRequestId = shallowRef<number | null>(null);
  readonly fetchState = shallowRef<DataState<PurchaseOrderModel | null>>(new DataInitial());
  readonly offersState = shallowRef<DataState<PurchaseRequestPriceModel[]>>(new DataInitial());
  readonly isIssuing = shallowRef(false);
  readonly issued = shallowRef(false);
  readonly refreshRequired = shallowRef(false);
  readonly request = computed(() => {
    const requests = PurchaseRequestController.getInstance();
    return requests.quoteId.value === this.quoteId.value
      ? requests.listState.value.data?.find(
          (request) =>
            request.id === this.purchaseRequestId.value && request.quoteId === this.quoteId.value,
        )
      : undefined;
  });
  readonly canStore = computed(
    () =>
      this.request.value?.status === 1 &&
      !this.fetchState.value.data &&
      !this.isIssuing.value &&
      !this.blocked.has(this.ownerKey()) &&
      !this.refreshRequired.value,
  );
  private constructor() {
    super();
  }
  static getInstance() {
    return (this.instance ??= new PurchaseOrderController());
  }
  protected get repository() {
    return PurchaseOrderRepository.getInstance();
  }
  protected get config() {
    return { autoRetry: false, showSuccessTosat: false, showErrorTosat: false };
  }
  protected handleItemResponse() {
    return;
  }
  protected captureMutationScope() {
    const epoch = this.epoch;
    return () => epoch === this.epoch && !!this.request.value;
  }
  private ownerKey() {
    return `${this.quoteId.value}:${this.purchaseRequestId.value}`;
  }
  isStoreBlocked(quoteId: number, purchaseRequestId: number) {
    return this.blocked.has(`${quoteId}:${purchaseRequestId}`);
  }
  activate(quoteId: number, purchaseRequestId: number) {
    this.release();
    this.quoteId.value = quoteId;
    this.purchaseRequestId.value = purchaseRequestId;
    this.refreshRequired.value = this.blocked.has(this.ownerKey());
    return !!this.request.value;
  }
  release() {
    this.epoch++;
    this.fetchSequence++;
    this.offersSequence++;
    this.quoteId.value = null;
    this.purchaseRequestId.value = null;
    this.fetchState.value = new DataInitial();
    this.offersState.value = new DataInitial();
    this.itemState.value = new DataInitial();
    this.issued.value = false;
    this.refreshRequired.value = false;
  }
  private invalid() {
    return new DataFailed<PurchaseOrderModel | null>({
      error: new ErrorModel('procurement.orders.invalid_response', ErrorType.dataDirty),
    });
  }
  async fetchOne(
    params?: Params,
    options?: ApiCallOptions,
  ): Promise<DataState<PurchaseOrderModel | null>> {
    const id = this.purchaseRequestId.value;
    if (
      !id ||
      !this.request.value ||
      (params && (!(params instanceof FetchPurchaseOrderParams) || params.purchaseRequestId !== id))
    )
      return new DataCancelled();
    const current = this.captureMutationScope();
    const sequence = ++this.fetchSequence;
    this.fetchState.value = new DataLoading();
    const result = await this.repository.show(new FetchPurchaseOrderParams(id), options);
    if (!current() || sequence !== this.fetchSequence) return new DataCancelled();
    const order = result.data;
    this.fetchState.value =
      order &&
      (order.purchaseRequest.id !== id ||
        order.purchaseRequest.quoteId !== this.quoteId.value ||
        order.purchaseRequest.status !== 3)
        ? this.invalid()
        : result;
    if (
      !this.issued.value &&
      this.fetchState.value instanceof DataSuccess &&
      this.fetchState.value.data
    )
      this.refreshRequired.value = false;
    return this.fetchState.value;
  }
  async loadOffers() {
    const id = this.purchaseRequestId.value;
    if (!id || !this.request.value) return;
    const current = this.captureMutationScope();
    const sequence = ++this.offersSequence;
    this.offersState.value = new DataLoading();
    const offers = await PurchaseRequestPricesRepository.getInstance().index(
      new FetchPurchaseRequestPricesParams(id),
    );
    if (!current() || sequence !== this.offersSequence) return;
    this.offersState.value = offers.data?.some((offer) => offer.purchaseRequestId !== id)
      ? new DataFailed({
          error: new ErrorModel('procurement.orders.invalid_response', ErrorType.dataDirty),
        })
      : offers;
  }
  async refreshForStore() {
    const current = this.captureMutationScope();
    const requests = await PurchaseRequestController.getInstance().fetchList();
    if (!current()) return false;
    await this.loadOffers();
    return (
      current() && requests instanceof DataSuccess && this.offersState.value instanceof DataSuccess
    );
  }
  async create(params: Params, options?: ApiCallOptions) {
    if (
      !this.canStore.value ||
      !(params instanceof StorePurchaseOrderParams) ||
      params.purchaseRequestId !== this.purchaseRequestId.value ||
      !params.validate().isValid
    )
      return new DataCancelled<PurchaseOrderModel | null>();
    const current = this.captureMutationScope();
    const key = this.ownerKey();
    this.isIssuing.value = true;
    try {
      // Recheck request ownership/status and the selected offer before this non-idempotent write.
      await this.refreshForStore();
      if (
        !current() ||
        this.request.value?.status !== 1 ||
        this.fetchState.value.data ||
        !(this.offersState.value instanceof DataSuccess) ||
        !this.offersState.value.data?.some(
          (offer: PurchaseRequestPriceModel) =>
            offer.id === params.purchaseRequestPriceId &&
            offer.purchaseRequestId === params.purchaseRequestId &&
            offer.supplier !== null,
        )
      )
        return new DataCancelled<PurchaseOrderModel | null>();
      this.blocked.add(key);
      const result = await super.create(params, options);
      if (!current()) return new DataCancelled<PurchaseOrderModel | null>();
      if (result instanceof DataSuccess) {
        this.issued.value = true;
        this.refreshRequired.value = true;
        const refreshed = await this.refreshForStore();
        const order = await this.fetchOne();
        if (current() && refreshed && order instanceof DataSuccess && order.data)
          this.refreshRequired.value = false;
      } else {
        // Validation failures keep the draft; uncertain outcomes require read-only verification.
        const type = result?.error?.type;
        if (type === ErrorType.validation) this.blocked.delete(key);
        else this.refreshRequired.value = true;
      }
      return result;
    } finally {
      this.isIssuing.value = false;
    }
  }
  async retryLastOperation() {
    const refreshed = await this.refreshForStore();
    if (this.issued.value) {
      const order = await this.fetchOne();
      if (refreshed && order instanceof DataSuccess && order.data)
        this.refreshRequired.value = false;
    }
    return this.itemState.value;
  }
}
