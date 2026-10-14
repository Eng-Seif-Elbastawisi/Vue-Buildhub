import BaseRepository from '@/base/Domain/Repositories/baseRepository';
import type Params from '@/base/Core/Params/params';
import type { ApiCallOptions } from '@/base/Data/ApiService/baseApiService';
import { ErrorModel, ErrorType } from '@/base/Core/NetworkStructure/Resources/errors/errorModel';
import {
  DataTimeout,
  DataNoNetwork,
  DataRateLimited,
} from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import PurchaseRequestPriceModel from '../../core/models/purchase-request.price.model';
import PurchaseRequestPricesApiService, {
  purchaseRequestPricesOptions,
} from '../api/purchase-request-prices.api-service';
export default class PurchaseRequestPricesRepository extends BaseRepository<
  void,
  PurchaseRequestPriceModel[]
> {
  private static instance: PurchaseRequestPricesRepository;
  private constructor() {
    super();
  }
  static getInstance() {
    return (this.instance ??= new PurchaseRequestPricesRepository());
  }
  protected get apiService() {
    return PurchaseRequestPricesApiService.getInstance();
  }
  protected get config() {
    return { hasPagination: false, dataKey: 'data' };
  }
  // Store data is opaque until its schema is confirmed; no saved record is fabricated.
  protected parseItem(): void {
    return;
  }
  protected parseList(payload: unknown) {
    if (!Array.isArray(payload)) throw new Error('procurement.offers.invalid_response');
    const offers = payload.map(PurchaseRequestPriceModel.fromJson);
    const supplierIds = offers.flatMap((offer) => (offer.supplier ? [offer.supplier.id] : []));
    if (
      new Set(supplierIds).size !== supplierIds.length ||
      new Set(offers.map((offer) => offer.id)).size !== offers.length
    )
      throw new Error('procurement.offers.invalid_response');
    return offers;
  }
  async index(params?: Params, options?: ApiCallOptions) {
    const requests = await super.index(
      params,
      { ...options, ...purchaseRequestPricesOptions },
      false,
    );
    // Base parsing failures can retain a successful server message; label invalid data explicitly.
    if (requests.error?.type === ErrorType.dataDirty)
      requests.error = new ErrorModel('procurement.offers.invalid_response', ErrorType.dataDirty);
    return requests;
  }
  async create(params: Params, options?: ApiCallOptions) {
    const saved = await super.create(
      params,
      { ...options, ...purchaseRequestPricesOptions },
      false,
    );
    // A timed-out Store may already have committed; never attach a replay callback.
    if (
      saved instanceof DataTimeout ||
      saved instanceof DataNoNetwork ||
      saved instanceof DataRateLimited
    )
      saved.retryFn = undefined;
    return saved;
  }
}
