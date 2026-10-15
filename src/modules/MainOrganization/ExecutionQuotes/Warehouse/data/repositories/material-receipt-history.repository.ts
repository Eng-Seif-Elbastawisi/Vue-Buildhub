import BaseRepository from '@/base/Domain/Repositories/baseRepository';
import type Params from '@/base/Core/Params/params';
import type { ApiCallOptions } from '@/base/Data/ApiService/baseApiService';
import PurchaseRequestReceiptModel from '../../core/models/purchase-request-receipt.model';
import MaterialReceiptApiService, { receiptOptions } from '../api/material-receipt.api-service';
export default class MaterialReceiptHistoryRepository extends BaseRepository<
  PurchaseRequestReceiptModel[],
  PurchaseRequestReceiptModel[]
> {
  private static instance: MaterialReceiptHistoryRepository;
  private constructor() {
    super();
  }
  static getInstance() {
    return (this.instance ??= new MaterialReceiptHistoryRepository());
  }
  protected get apiService() {
    return MaterialReceiptApiService.getInstance();
  }
  protected get config() {
    return { hasPagination: false, dataKey: 'data' };
  }
  protected parseItem(payload: unknown) {
    if (!Array.isArray(payload)) throw new Error('material_receipt.invalid_response');
    return payload.map(PurchaseRequestReceiptModel.fromJson);
  }
  protected parseList(payload: unknown) {
    return this.parseItem(payload);
  }
  async show(params?: Params, options?: ApiCallOptions) {
    const result = await super.show(params, { ...options, ...receiptOptions }, false);
    if (!result.hasError && result.data === null) result.data = [];
    return result;
  }
}
