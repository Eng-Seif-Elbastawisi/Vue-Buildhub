import BaseRepository from '@/base/Domain/Repositories/baseRepository';
import type Params from '@/base/Core/Params/params';
import type { ApiCallOptions } from '@/base/Data/ApiService/baseApiService';
import PurchaseRequestDisbursementModel from '../../core/models/purchase-request-disbursement.model';
import MaterialDisbursementApiService, {
  disbursementOptions,
} from '../api/material-disbursement.api-service';

export default class MaterialDisbursementHistoryRepository extends BaseRepository<
  PurchaseRequestDisbursementModel[],
  PurchaseRequestDisbursementModel[]
> {
  private static instance: MaterialDisbursementHistoryRepository;

  private constructor() {
    super();
  }

  static getInstance() {
    return (this.instance ??= new MaterialDisbursementHistoryRepository());
  }

  protected get apiService() {
    return MaterialDisbursementApiService.getInstance();
  }

  protected get config() {
    return { hasPagination: false, dataKey: 'data' };
  }

  protected parseItem(payload: unknown) {
    if (!Array.isArray(payload)) throw new Error('material_disbursement.invalid_response');
    return payload.map(PurchaseRequestDisbursementModel.fromJson);
  }

  protected parseList(payload: unknown) {
    return this.parseItem(payload);
  }

  async show(params?: Params, options?: ApiCallOptions) {
    const result = await super.show(params, { ...options, ...disbursementOptions }, false);
    if (!result.hasError && result.data === null) result.data = [];
    return result;
  }
}
