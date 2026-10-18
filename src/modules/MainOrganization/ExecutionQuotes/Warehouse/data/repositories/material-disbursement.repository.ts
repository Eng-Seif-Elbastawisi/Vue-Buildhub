import BaseRepository from '@/base/Domain/Repositories/baseRepository';
import type Params from '@/base/Core/Params/params';
import type { ApiCallOptions } from '@/base/Data/ApiService/baseApiService';
import {
  DataNoNetwork,
  DataRateLimited,
  DataTimeout,
} from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import DisbursementStockModel from '../../core/models/disbursement-stock.model';
import MaterialDisbursementApiService, {
  disbursementOptions,
} from '../api/material-disbursement.api-service';

export default class MaterialDisbursementRepository extends BaseRepository<
  void,
  DisbursementStockModel[]
> {
  private static instance: MaterialDisbursementRepository;

  private constructor() {
    super();
  }

  static getInstance() {
    return (this.instance ??= new MaterialDisbursementRepository());
  }

  protected get apiService() {
    return MaterialDisbursementApiService.getInstance();
  }

  protected get config() {
    return { hasPagination: false, dataKey: 'data' };
  }

  protected parseItem(): void {
    return;
  }

  protected parseList(payload: unknown) {
    if (!Array.isArray(payload)) throw new Error('material_disbursement.invalid_response');
    return payload.map(DisbursementStockModel.fromJson);
  }

  async index(params?: Params, options?: ApiCallOptions) {
    const result = await super.index(params, { ...options, ...disbursementOptions }, false);
    if (!result.hasError && result.data === null) result.data = [];
    return result;
  }

  async create(params: Params, options?: ApiCallOptions) {
    const result = await super.create(params, { ...options, ...disbursementOptions }, false);
    if (
      result instanceof DataTimeout ||
      result instanceof DataNoNetwork ||
      result instanceof DataRateLimited
    )
      result.retryFn = undefined;
    return result;
  }
}
