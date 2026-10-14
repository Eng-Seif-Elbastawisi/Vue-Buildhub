import BaseRepository from '@/base/Domain/Repositories/baseRepository';
import type Params from '@/base/Core/Params/params';
import type { ApiCallOptions } from '@/base/Data/ApiService/baseApiService';
import { ErrorModel, ErrorType } from '@/base/Core/NetworkStructure/Resources/errors/errorModel';
import PurchaseOrderModel from '../../core/models/purchase.order.model';
import PurchaseOrderApiService, { purchaseOrderOptions } from '../api/purchase.order.api-service';
import {
  DataTimeout,
  DataNoNetwork,
  DataRateLimited,
} from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
export default class PurchaseOrderRepository extends BaseRepository<PurchaseOrderModel | null> {
  private static instance: PurchaseOrderRepository;
  private constructor() {
    super();
  }
  static getInstance() {
    return (this.instance ??= new PurchaseOrderRepository());
  }
  protected get apiService() {
    return PurchaseOrderApiService.getInstance();
  }
  protected parseItem(payload: unknown) {
    return payload == null ? null : PurchaseOrderModel.fromJson(payload);
  }
  protected parseList(): (PurchaseOrderModel | null)[] {
    throw new Error('Purchase orders have no list endpoint');
  }
  async show(params?: Params, options?: ApiCallOptions) {
    const result = await super.show(params, { ...options, ...purchaseOrderOptions }, false);
    if (result.error?.type === ErrorType.dataDirty)
      result.error = new ErrorModel('procurement.orders.invalid_response', ErrorType.dataDirty);
    return result;
  }
  async create(params: Params, options?: ApiCallOptions) {
    // Mutation data is undocumented. Consume the verified generic success envelope only.
    const result = await super.create(params, { ...options, ...purchaseOrderOptions }, false);
    if (
      result instanceof DataTimeout ||
      result instanceof DataNoNetwork ||
      result instanceof DataRateLimited
    )
      result.retryFn = undefined;
    return result;
  }
}
