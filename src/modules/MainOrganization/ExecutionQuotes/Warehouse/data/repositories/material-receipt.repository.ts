import BaseRepository from '@/base/Domain/Repositories/baseRepository';
import type Params from '@/base/Core/Params/params';
import type { ApiCallOptions } from '@/base/Data/ApiService/baseApiService';
import {
  DataNoNetwork,
  DataRateLimited,
  DataTimeout,
} from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import PurchaseRequestReceiptItemSummaryModel from '../../core/models/purchase-request-receipt-item-summary.model';
import MaterialReceiptApiService, { receiptOptions } from '../api/material-receipt.api-service';
export default class MaterialReceiptRepository extends BaseRepository<
  void,
  PurchaseRequestReceiptItemSummaryModel[]
> {
  private static instance: MaterialReceiptRepository;
  private constructor() {
    super();
  }
  static getInstance() {
    return (this.instance ??= new MaterialReceiptRepository());
  }
  protected get apiService() {
    return MaterialReceiptApiService.getInstance();
  }
  protected get config() {
    return { hasPagination: false, dataKey: 'data' };
  }
  protected parseItem(): void {
    return;
  }
  protected parseList(payload: unknown) {
    if (!Array.isArray(payload)) throw new Error('material_receipt.invalid_response');
    return payload.map(PurchaseRequestReceiptItemSummaryModel.fromJson);
  }
  async index(params?: Params, options?: ApiCallOptions) {
    const result = await super.index(params, { ...options, ...receiptOptions }, false);
    // BaseRepository represents an empty list with null data.
    if (!result.hasError && result.data === null) result.data = [];
    return result;
  }
  async create(params: Params, options?: ApiCallOptions) {
    const result = await super.create(params, { ...options, ...receiptOptions }, false);
    if (
      result instanceof DataTimeout ||
      result instanceof DataNoNetwork ||
      result instanceof DataRateLimited
    )
      result.retryFn = undefined;
    return result;
  }
}
