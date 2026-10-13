import BaseApiService, {
  type ApiCallOptions,
  type ApiResponse,
} from '@/base/Data/ApiService/baseApiService';
import type Params from '@/base/Core/Params/params';
import { ValidationException } from '@/base/Core/Constants/exceptionConstants';
import { PurchaseRequestEndpoints } from './purchase-request.api.endpoints';
export const purchaseRequestOptions = {
  useJson: true,
  usePost: true,
  auth: true,
  useStaticData: false,
  enableRetry: false,
};
export default class PurchaseRequestApiService extends BaseApiService {
  private static instance: PurchaseRequestApiService;
  private constructor() {
    super();
  }
  static getInstance() {
    return (this.instance ??= new PurchaseRequestApiService());
  }
  protected get endpoints() {
    return new PurchaseRequestEndpoints();
  }
  protected get defaultOptions() {
    return { ...super.defaultOptions, ...purchaseRequestOptions };
  }
  private validateParams(params?: Params) {
    if (!params) throw new Error('procurement.invalid_form');
    const validation = params.validate();
    if (!validation.isValid) {
      const errors: Record<string, string[]> = {};
      validation.errors.forEach((error) => (errors[error.field] ??= []).push(error.message));
      throw new ValidationException('procurement.invalid_form', errors);
    }
  }
  private responseBody(payload: unknown, errorKey: string): Record<string, unknown> {
    if (!payload || typeof payload !== 'object' || Array.isArray(payload))
      throw new Error(errorKey);
    return payload as Record<string, unknown>;
  }
  async index(params?: Params, options?: ApiCallOptions): Promise<ApiResponse<unknown>> {
    this.validateParams(params);
    const response = await super.index(params, { ...options, ...purchaseRequestOptions }, false);
    const body = this.responseBody(response.data as unknown, 'procurement.invalid_response');
    if (typeof body.status !== 'boolean') throw new Error('procurement.invalid_response');
    if (body.status && !Array.isArray(body.data)) throw new Error('procurement.invalid_response');
    return response;
  }
  async create(params: Params, options?: ApiCallOptions): Promise<ApiResponse<unknown>> {
    this.validateParams(params);
    const response = await super.create(params, { ...options, ...purchaseRequestOptions }, false);
    const body = this.responseBody(response.data as unknown, 'procurement.unconfirmed_store');
    // HTTP success alone cannot confirm this undocumented mutation response.
    if (typeof body.status !== 'boolean') throw new Error('procurement.unconfirmed_store');
    return response;
  }
}
