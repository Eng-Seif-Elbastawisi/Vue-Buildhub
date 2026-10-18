import BaseApiService, {
  type ApiCallOptions,
  type ApiResponse,
} from '@/base/Data/ApiService/baseApiService';
import type Params from '@/base/Core/Params/params';
import { ValidationException } from '@/base/Core/Constants/exceptionConstants';
import { MaterialReceiptEndpoints } from './material-receipt.api.endpoints';

export const receiptOptions = {
  useJson: true,
  usePost: true,
  auth: true,
  useStaticData: false,
  enableRetry: false,
};
export default class MaterialReceiptApiService extends BaseApiService {
  private static instance: MaterialReceiptApiService;
  private constructor() {
    super();
  }
  static getInstance() {
    return (this.instance ??= new MaterialReceiptApiService());
  }
  protected get endpoints() {
    return new MaterialReceiptEndpoints();
  }
  protected get defaultOptions() {
    return { ...super.defaultOptions, ...receiptOptions };
  }
  private validateParams(params?: Params) {
    if (!params) throw new Error('material_receipt.invalid_form');
    const validation = params.validate();
    if (!validation.isValid) {
      const errors: Record<string, string[]> = {};
      validation.errors.forEach((error) => (errors[error.field] ??= []).push(error.message));
      throw new ValidationException('material_receipt.invalid_form', errors);
    }
  }
  private check(
    response: ApiResponse<unknown>,
    list: boolean,
    errorKey = 'material_receipt.invalid_response',
  ): ApiResponse<unknown> {
    const body = response.data;
    if (!body || typeof body !== 'object' || Array.isArray(body)) throw new Error(errorKey);
    const record = body as Record<string, unknown>;
    if (
      typeof record.status !== 'boolean' ||
      (list && record.status && !Array.isArray(record.data))
    )
      throw new Error(errorKey);
    return response;
  }
  async index(params?: Params, options?: ApiCallOptions): Promise<ApiResponse<unknown>> {
    this.validateParams(params);
    return this.check(await super.index(params, { ...options, ...receiptOptions }, false), true);
  }
  async show(params?: Params, options?: ApiCallOptions): Promise<ApiResponse<unknown>> {
    this.validateParams(params);
    return this.check(await super.show(params, { ...options, ...receiptOptions }, false), true);
  }
  async create(params: Params, options?: ApiCallOptions): Promise<ApiResponse<unknown>> {
    this.validateParams(params);
    return this.check(
      await super.create(params, { ...options, ...receiptOptions }, false),
      false,
      'material_receipt.unconfirmed_store',
    );
  }
}
