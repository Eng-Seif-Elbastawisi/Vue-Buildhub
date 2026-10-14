import { computed, shallowRef } from 'vue';
import SuppliersRepository from '@/modules/MainOrganization/Suppliers/data/repositories/Suppliers.repository';
import { validId } from '../../../Schedule/core/constants/schedule.constants';
import BaseController from '@/base/Presentation/Controller/baseController';
import type Params from '@/base/Core/Params/params';
import type { ApiCallOptions } from '@/base/Data/ApiService/baseApiService';
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
import type { FieldError } from '@/base/Presentation/Utils/classValidation';
import PurchaseRequestPricesRepository from '../../data/repositories/purchase-request-prices.repository';
import type PurchaseRequestPriceModel from '../../core/models/purchase-request.price.model';
import FetchPurchaseRequestPricesParams from '../../core/params/fetch.purchase-request-prices.params';
import StorePurchaseRequestPricesParams from '../../core/params/store.purchase-request-prices.params';
import PurchaseRequestSupplierPriceParams from '../../core/params/purchase-request.supplier-price.params';
import { supplierPriceNumber } from '../../core/params/supplier-price.decimal';
import PurchaseRequestController from './purchase-request.controller';

export interface SupplierOfferDraft {
  key: number;
  supplier: TitleInterface<string | number> | null;
  price: string;
  duration: string;
  durationType: TitleInterface<string | number> | null;
}
export default class PurchaseRequestPricesController extends BaseController<
  void,
  PurchaseRequestPriceModel[]
> {
  private static instance: PurchaseRequestPricesController;
  private epoch = 0;
  private sequence = 0;
  private rowKey = 0;
  private baseline = shallowRef('');
  private confirmationSignature: string | null = null;
  private readonly quoteId = shallowRef<number | null>(null);
  readonly purchaseRequestId = shallowRef<number | null>(null);
  readonly savedOffers = shallowRef<PurchaseRequestPriceModel[]>([]);
  readonly draft = shallowRef<SupplierOfferDraft[]>([]);
  readonly loaded = shallowRef(false);
  readonly isSyncing = shallowRef(false);
  readonly refreshRequired = shallowRef(false);
  readonly confirmedSync = shallowRef(false);
  readonly confirmationVisible = shallowRef(false);
  readonly errors = shallowRef<FieldError[]>([]);
  readonly dirty = computed(() => this.signature(this.draft.value) !== this.baseline.value);
  readonly removedOffers = computed(() => {
    const ids = new Set(this.draft.value.map((row) => Number(row.supplier?.id)));
    return this.savedOffers.value.filter((offer) => offer.supplier && !ids.has(offer.supplier.id));
  });
  readonly readOnly = computed(() => {
    const requests = PurchaseRequestController.getInstance();
    return (
      requests.quoteId.value !== this.quoteId.value ||
      !requests.listState.value.data?.some(
        (request) =>
          request.id === this.purchaseRequestId.value &&
          request.quoteId === this.quoteId.value &&
          request.status === 1,
      )
    );
  });
  readonly canSave = computed(
    () =>
      !this.readOnly.value &&
      this.loaded.value &&
      !this.isSyncing.value &&
      !this.refreshRequired.value &&
      this.dirty.value,
  );
  private constructor() {
    super();
  }
  static getInstance() {
    return (this.instance ??= new PurchaseRequestPricesController());
  }
  protected get repository() {
    return PurchaseRequestPricesRepository.getInstance();
  }
  protected get config() {
    return { autoRetry: false, showSuccessTosat: false, showErrorTosat: false };
  }
  protected handleItemResponse() {
    return;
  }
  private ownsRequest() {
    const requests = PurchaseRequestController.getInstance();
    return (
      requests.quoteId.value === this.quoteId.value &&
      requests.listState.value.data?.some(
        (request) =>
          request.id === this.purchaseRequestId.value && request.quoteId === this.quoteId.value,
      ) === true
    );
  }
  protected captureMutationScope() {
    const epoch = this.epoch;
    return () => epoch === this.epoch && this.ownsRequest();
  }
  activate(quoteId: number, purchaseRequestId: number) {
    this.release();
    this.quoteId.value = quoteId;
    this.purchaseRequestId.value = purchaseRequestId;
    if (!this.ownsRequest()) {
      this.release();
      return false;
    }
    return true;
  }
  release() {
    this.epoch++;
    this.sequence++;
    this.quoteId.value = null;
    this.purchaseRequestId.value = null;
    this.draft.value = [];
    this.savedOffers.value = [];
    this.baseline.value = this.signature(this.draft.value);
    this.loaded.value = false;
    this.refreshRequired.value = false;
    this.confirmedSync.value = false;
    this.confirmationVisible.value = false;
    this.confirmationSignature = null;
    this.errors.value = [];
    this.listState.value = new DataInitial();
    this.itemState.value = new DataInitial();
    // An in-flight Sync lock survives owner switches until its transport finishes.
  }
  createSupplierLookup() {
    const state = shallowRef<DataState<TitleInterface<string | number>[]>>(new DataInitial());
    let sequence = 0;
    return {
      state,
      pagination: computed(() => state.value.pagination),
      isListFailed: () => state.value.hasError && !(state.value instanceof DataEmpty),
      isListSuccess: () => state.value instanceof DataSuccess || state.value instanceof DataEmpty,
      fetchAsOptions: async (params?: Params): Promise<TitleInterface<string | number>[]> => {
        if (!this.ownsRequest()) return [];
        const current = this.captureMutationScope();
        const request = ++sequence;
        state.value = new DataLoading();
        const suppliers = await SuppliersRepository.getInstance().index(
          params,
          { useJson: true, useStaticData: false, enableRetry: false },
          false,
        );
        if (!current() || request !== sequence) return [];
        const options = (suppliers.data ?? [])
          .filter((supplier) => validId(Number(supplier.id)) && typeof supplier.name === 'string')
          .map((supplier) => new TitleInterface({ id: Number(supplier.id), title: supplier.name }));
        state.value =
          suppliers instanceof DataSuccess || suppliers instanceof DataEmpty
            ? new DataSuccess({ data: options, pagination: suppliers.pagination })
            : new DataFailed({ error: suppliers.error });
        return options;
      },
    };
  }
  private signature(rows: SupplierOfferDraft[]) {
    return JSON.stringify(
      rows.map(({ supplier, price, duration, durationType }) => ({
        id: supplier == null ? null : Number(supplier.id),
        price: supplierPriceNumber(price) ?? price,
        duration: /^\d+$/.test(duration) ? Number(duration) : duration,
        durationType: durationType == null ? null : Number(durationType.id),
      })),
    );
  }
  addSupplier() {
    if (
      this.readOnly.value ||
      !this.loaded.value ||
      this.isSyncing.value ||
      this.confirmationVisible.value ||
      this.refreshRequired.value
    )
      return;
    this.draft.value = [
      ...this.draft.value,
      { key: ++this.rowKey, supplier: null, price: '', duration: '', durationType: null },
    ];
  }
  updateRow(key: number, fields: Partial<SupplierOfferDraft>) {
    if (
      this.readOnly.value ||
      this.isSyncing.value ||
      this.confirmationVisible.value ||
      this.refreshRequired.value
    )
      return;
    if (
      fields.supplier &&
      this.draft.value.some(
        (row) => row.key !== key && Number(row.supplier?.id) === Number(fields.supplier?.id),
      )
    ) {
      this.errors.value = [
        { field: 'suppliers', message: 'procurement.offers.duplicate_supplier' },
      ];
      return;
    }
    this.errors.value = [];
    this.draft.value = this.draft.value.map((row) =>
      row.key === key ? { ...row, ...fields, key: row.key } : row,
    );
  }
  removeSupplier(key: number) {
    if (
      this.readOnly.value ||
      this.isSyncing.value ||
      this.confirmationVisible.value ||
      this.refreshRequired.value
    )
      return;
    this.draft.value = this.draft.value.filter((row) => row.key !== key);
    this.errors.value = [];
  }
  private rowsFromOffers(offers: PurchaseRequestPriceModel[]) {
    return offers.map((offer) => ({
      key: ++this.rowKey,
      supplier: offer.supplier
        ? new TitleInterface({ id: offer.supplier.id, title: offer.supplier.name ?? '' })
        : null,
      price: offer.price ?? '',
      duration: offer.duration == null ? '' : String(offer.duration),
      durationType:
        offer.durationType == null
          ? null
          : new TitleInterface({ id: offer.durationType, title: '' }),
    }));
  }
  private restore(offers: PurchaseRequestPriceModel[]) {
    this.draft.value = this.rowsFromOffers(offers);
    this.baseline.value = this.signature(this.draft.value);
    this.errors.value = [];
  }
  discardDraft() {
    if (this.isSyncing.value) return;
    this.cancelConfirmation();
    this.restore(this.savedOffers.value);
    this.itemState.value = new DataInitial();
  }
  // Fetch is intentionally unpaginated; only a complete, mapped collection can unlock Sync.
  async fetchList(
    params?: Params,
    options?: ApiCallOptions,
  ): Promise<DataState<PurchaseRequestPriceModel[]>> {
    if (
      !this.ownsRequest() ||
      (params &&
        (!(params instanceof FetchPurchaseRequestPricesParams) ||
          params.purchaseRequestId !== this.purchaseRequestId.value))
    )
      return new DataCancelled();
    if (this.isSyncing.value && !this.confirmedSync.value) return new DataCancelled();
    const current = this.captureMutationScope();
    const sequence = ++this.sequence;
    this.loaded.value = false;
    this.listState.value = new DataLoading();
    const result = await this.repository.index(
      new FetchPurchaseRequestPricesParams(this.purchaseRequestId.value ?? 0),
      options,
    );
    if (!current() || sequence !== this.sequence) return new DataCancelled();
    const complete = result instanceof DataSuccess || result instanceof DataEmpty;
    const offers = result.data ?? [];
    if (
      complete &&
      offers.some((offer) => offer.purchaseRequestId !== this.purchaseRequestId.value)
    ) {
      this.listState.value = new DataFailed({
        error: new ErrorModel('procurement.offers.invalid_response', ErrorType.dataDirty),
      });
      return this.listState.value;
    }
    this.listState.value = result;
    if (complete) {
      // Missing supplier relation cannot be safely resubmitted as a complete collection.
      this.loaded.value = offers.every((offer) => offer.supplier !== null);
      this.savedOffers.value = offers;
      if (!this.dirty.value || (this.refreshRequired.value && this.confirmedSync.value))
        this.restore(offers);
      else this.baseline.value = this.signature(this.rowsFromOffers(offers));
      this.refreshRequired.value = false;
    }
    return result;
  }
  private params() {
    return new StorePurchaseRequestPricesParams(
      this.purchaseRequestId.value ?? 0,
      this.draft.value.map(
        (row) =>
          new PurchaseRequestSupplierPriceParams(
            Number(row.supplier?.id),
            supplierPriceNumber(row.price) ?? NaN,
            /^\d+$/.test(row.duration) ? Number(row.duration) : NaN,
            Number(row.durationType?.id),
          ),
      ),
    );
  }
  async save() {
    if (!this.canSave.value || !this.ownsRequest()) return new DataCancelled<void>();
    const params = this.params();
    const validation = params.validate();
    this.errors.value = validation.errors;
    if (!validation.isValid) return new DataCancelled<void>();
    if (this.removedOffers.value.length) {
      this.confirmationSignature = this.signature(this.draft.value);
      this.confirmationVisible.value = true;
      return new DataCancelled<void>();
    }
    return this.create(params);
  }
  cancelConfirmation() {
    this.confirmationVisible.value = false;
    this.confirmationSignature = null;
  }
  async confirmSave() {
    if (
      !this.confirmationVisible.value ||
      this.confirmationSignature !== this.signature(this.draft.value)
    )
      return new DataCancelled<void>();
    const result = await this.create(this.params());
    this.cancelConfirmation();
    return result;
  }
  async create(params: Params, options?: ApiCallOptions) {
    if (
      !this.canSave.value ||
      !this.ownsRequest() ||
      !(params instanceof StorePurchaseRequestPricesParams) ||
      params.purchaseRequestId !== this.purchaseRequestId.value ||
      JSON.stringify(params.toMap()) !== JSON.stringify(this.params().toMap()) ||
      !params.validate().isValid ||
      (this.removedOffers.value.length &&
        this.confirmationSignature !== this.signature(this.draft.value))
    )
      return new DataCancelled<void>();
    const current = this.captureMutationScope();
    this.isSyncing.value = true;
    this.confirmedSync.value = false;
    try {
      const result = await super.create(params, options);
      if (!current()) return new DataCancelled<void>();
      if (result instanceof DataSuccess) {
        this.confirmedSync.value = true;
        this.refreshRequired.value = true;
        await this.fetchList();
      } else if (
        result?.error &&
        (result.error.title === 'procurement.offers.unconfirmed_sync' ||
          result.error.type === ErrorType.timeout ||
          result.error.type === ErrorType.networkConnection ||
          result.error.type === ErrorType.rateLimit)
      ) {
        // Transport failure may follow a committed Sync. Verify saved state before another write.
        this.refreshRequired.value = true;
      }
      return current() ? result : new DataCancelled<void>();
    } finally {
      this.isSyncing.value = false;
    }
  }
  async retryLastOperation() {
    return this.fetchList();
  }
}
