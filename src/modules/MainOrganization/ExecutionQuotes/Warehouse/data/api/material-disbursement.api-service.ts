import BaseApiService, {
  type ApiCallOptions,
  type ApiResponse,
} from '@/base/Data/ApiService/baseApiService';
import type Params from '@/base/Core/Params/params';
import { ValidationException } from '@/base/Core/Constants/exceptionConstants';
import { MaterialDisbursementEndpoints } from './material-disbursement.api.endpoints';

export const disbursementOptions = {
  useJson: true,
  usePost: true,
  auth: true,
  useStaticData: false,
  enableRetry: false,
};

export default class MaterialDisbursementApiService extends BaseApiService {
  private static instance: MaterialDisbursementApiService;

  private constructor() {
    super();
  }

  static getInstance() {
    return (this.instance ??= new MaterialDisbursementApiService());
  }

  protected get endpoints() {
    return new MaterialDisbursementEndpoints();
  }

  protected get defaultOptions() {
    return { ...super.defaultOptions, ...disbursementOptions };
  }

  private validateParams(params?: Params) {
    if (!params) throw new Error('material_disbursement.invalid_form');
    const validation = params.validate();
    if (!validation.isValid) {
      const errors: Record<string, string[]> = {};
      validation.errors.forEach((error) => (errors[error.field] ??= []).push(error.message));
      throw new ValidationException('material_disbursement.invalid_form', errors);
    }
  }

  private check(response: ApiResponse<unknown>, list: boolean): ApiResponse<unknown> {
    const body = response.data;
    if (!body || typeof body !== 'object' || Array.isArray(body))
      throw new Error(
        list ? 'material_disbursement.invalid_response' : 'material_disbursement.unconfirmed_store',
      );
    const record = body as Record<string, unknown>;
    if (
      typeof record.status !== 'boolean' ||
      (list && record.status && !Array.isArray(record.data))
    )
      throw new Error(
        list ? 'material_disbursement.invalid_response' : 'material_disbursement.unconfirmed_store',
      );
    return response;
  }

  async index(params?: Params, options?: ApiCallOptions): Promise<ApiResponse<unknown>> {
    this.validateParams(params);
    return this.check(
      await super.index(params, { ...options, ...disbursementOptions }, false),
      true,
    );
  }

  async show(params?: Params, options?: ApiCallOptions): Promise<ApiResponse<unknown>> {
    this.validateParams(params);
    return this.check(
      await super.show(params, { ...options, ...disbursementOptions }, false),
      true,
    );
  }

  async create(params: Params, options?: ApiCallOptions): Promise<ApiResponse<unknown>> {
    this.validateParams(params);
    return this.check(
      await super.create(params, { ...options, ...disbursementOptions }, false),
      false,
    );
  }
}
