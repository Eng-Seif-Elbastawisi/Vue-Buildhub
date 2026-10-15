import BaseRepository from '@/base/Domain/Repositories/baseRepository';
import type Params from '@/base/Core/Params/params';
import type { ApiCallOptions } from '@/base/Data/ApiService/baseApiService';
import { ErrorModel, ErrorType } from '@/base/Core/NetworkStructure/Resources/errors/errorModel';
import {
  DataTimeout,
  DataNoNetwork,
  DataRateLimited,
} from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import PurchaseRequestModel from '../../core/models/purchase-request.model';
import PurchaseRequestApiService, {
  purchaseRequestOptions,
} from '../api/purchase-request.api-service';
export default class PurchaseRequestRepository extends BaseRepository<
  void,
  PurchaseRequestModel[]
> {
  private static instance: PurchaseRequestRepository;
  private constructor() {
    super();
  }
  static getInstance() {
    return (this.instance ??= new PurchaseRequestRepository());
  }
  protected get apiService() {
    return PurchaseRequestApiService.getInstance();
  }
  protected get config() {
    return { hasPagination: false, dataKey: 'data' };
  }
  // Store data is opaque until its schema is confirmed; no saved record is fabricated.
  protected parseItem(): void {
    return;
  }
  protected parseList(payload: unknown) {
    if (!Array.isArray(payload)) throw new Error('procurement.invalid_response');
    return payload.map((item) => PurchaseRequestModel.fromJson(item));
  }
  async index(params?: Params, options?: ApiCallOptions) {
    const requests = await super.index(params, { ...options, ...purchaseRequestOptions }, false);
    // Base parsing failures can retain a successful server message; label invalid data explicitly.
    if (requests.error?.type === ErrorType.dataDirty)
      requests.error = new ErrorModel('procurement.invalid_response', ErrorType.dataDirty);
    return requests;
  }
  async create(params: Params, options?: ApiCallOptions) {
    const saved = await super.create(params, { ...options, ...purchaseRequestOptions }, false);
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
