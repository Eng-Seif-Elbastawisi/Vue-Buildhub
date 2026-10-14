import BaseApiService, {
  type ApiCallOptions,
  type ApiResponse,
} from '@/base/Data/ApiService/baseApiService';
import type Params from '@/base/Core/Params/params';
import { ValidationException } from '@/base/Core/Constants/exceptionConstants';
import { PurchaseRequestPricesEndpoints } from './purchase-request-prices.api.endpoints';
export const purchaseRequestPricesOptions = {
  useJson: true,
  usePost: true,
  auth: true,
  useStaticData: false,
  enableRetry: false,
};
export default class PurchaseRequestPricesApiService extends BaseApiService {
  private static instance: PurchaseRequestPricesApiService;
  private constructor() {
    super();
  }
  static getInstance() {
    return (this.instance ??= new PurchaseRequestPricesApiService());
  }
  protected get endpoints() {
    return new PurchaseRequestPricesEndpoints();
  }
  protected get defaultOptions() {
    return { ...super.defaultOptions, ...purchaseRequestPricesOptions };
  }
  private validateParams(params?: Params) {
    if (!params) throw new Error('procurement.offers.invalid_form');
    const validation = params.validate();
    if (!validation.isValid) {
      const errors: Record<string, string[]> = {};
      validation.errors.forEach((error) => (errors[error.field] ??= []).push(error.message));
      throw new ValidationException('procurement.offers.invalid_form', errors);
    }
  }
  private responseBody(payload: unknown, errorKey: string): Record<string, unknown> {
    if (!payload || typeof payload !== 'object' || Array.isArray(payload))
      throw new Error(errorKey);
    return payload as Record<string, unknown>;
  }
  async index(params?: Params, options?: ApiCallOptions): Promise<ApiResponse<unknown>> {
    this.validateParams(params);
    const response = await super.index(
      params,
      { ...options, ...purchaseRequestPricesOptions },
      false,
    );
    const body = this.responseBody(response.data as unknown, 'procurement.offers.invalid_response');
    if (typeof body.status !== 'boolean') throw new Error('procurement.offers.invalid_response');
    if (body.status && (!Array.isArray(body.data) || body.meta != null || body.pagination != null))
      throw new Error('procurement.offers.invalid_response');
    return response;
  }
  async create(params: Params, options?: ApiCallOptions): Promise<ApiResponse<unknown>> {
    this.validateParams(params);
    const response = await super.create(
      params,
      { ...options, ...purchaseRequestPricesOptions },
      false,
    );
    const body = this.responseBody(response.data as unknown, 'procurement.offers.unconfirmed_sync');
    // HTTP success alone cannot confirm this undocumented mutation response.
    if (typeof body.status !== 'boolean') throw new Error('procurement.offers.unconfirmed_sync');
    return response;
  }
}
