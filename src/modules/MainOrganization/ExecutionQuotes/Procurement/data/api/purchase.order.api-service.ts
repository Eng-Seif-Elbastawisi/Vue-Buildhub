import BaseApiService, {
  type ApiCallOptions,
  type ApiResponse,
} from '@/base/Data/ApiService/baseApiService';
import type Params from '@/base/Core/Params/params';
import { ValidationException } from '@/base/Core/Constants/exceptionConstants';
import { PurchaseOrderEndpoints } from './purchase.order.api.endpoints';
export const purchaseOrderOptions = {
  useJson: true,
  usePost: true,
  auth: true,
  useStaticData: false,
  enableRetry: false,
};
export default class PurchaseOrderApiService extends BaseApiService {
  private static instance: PurchaseOrderApiService;
  private constructor() {
    super();
  }
  static getInstance() {
    return (this.instance ??= new PurchaseOrderApiService());
  }
  protected get endpoints() {
    return new PurchaseOrderEndpoints();
  }
  protected get defaultOptions() {
    return { ...super.defaultOptions, ...purchaseOrderOptions };
  }
  private validateParams(params?: Params) {
    if (!params) throw new Error('procurement.orders.invalid_form');
    const validation = params.validate();
    if (!validation.isValid) {
      const errors: Record<string, string[]> = {};
      validation.errors.forEach((error) => (errors[error.field] ??= []).push(error.message));
      throw new ValidationException('procurement.orders.invalid_form', errors);
    }
  }
  private responseBody(payload: unknown, errorKey: string): Record<string, unknown> {
    if (!payload || typeof payload !== 'object' || Array.isArray(payload))
      throw new Error(errorKey);
    return payload as Record<string, unknown>;
  }
  async show(params?: Params, options?: ApiCallOptions): Promise<ApiResponse<unknown>> {
    this.validateParams(params);
    const response = await super.show(params, { ...options, ...purchaseOrderOptions }, false);
    const body = this.responseBody(response.data as unknown, 'procurement.orders.invalid_response');
    if (typeof body.status !== 'boolean') throw new Error('procurement.orders.invalid_response');
    if (
      body.status &&
      (!('data' in body) ||
        (body.data !== null && (typeof body.data !== 'object' || Array.isArray(body.data))))
    )
      throw new Error('procurement.orders.invalid_response');
    return response;
  }
  async create(params: Params, options?: ApiCallOptions): Promise<ApiResponse<unknown>> {
    this.validateParams(params);
    const response = await super.create(params, { ...options, ...purchaseOrderOptions }, false);
    const body = this.responseBody(
      response.data as unknown,
      'procurement.orders.unconfirmed_store',
    );
    // HTTP success alone cannot confirm this undocumented mutation response.
    if (typeof body.status !== 'boolean') throw new Error('procurement.orders.unconfirmed_store');
    return { ...response, data: { ...response.data, data: null } };
  }
}
