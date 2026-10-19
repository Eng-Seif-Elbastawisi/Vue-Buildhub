import BaseApiService from '@/base/Data/ApiService/baseApiService';
import type { ApiCallOptions, ApiResponse } from '@/base/Data/ApiService/baseApiService';
import { CrudType } from '@/base/Data/ApiService/apiServiceInterface';
import { ValidationException } from '@/base/Core/Constants/exceptionConstants';
import type Params from '@/base/Core/Params/params';
import ScheduleGroupParams from '../../core/params/schedule.group.params';
import ScheduleOwnerParams from '../../core/params/schedule.owner.params';
import ScheduleSettingsParams from '../../core/params/schedule.settings.params';
import ChangeProjectTimelineOrderParams from '../../core/params/change.project.timeline.order.params';
import {
  ChangeTimelineApprovalParams,
  ChangeTimelineWorkStatusParams,
} from '../../core/params/schedule.status.params';
import { ScheduleEndpoints } from './schedule.api.endpoints';

// Confirmed requests. Unknown response bodies are never coerced into mutation success.
export default class ScheduleApiService extends BaseApiService {
  private static instance: ScheduleApiService;
  private constructor() {
    super();
  }
  static getInstance() {
    return (this.instance ??= new ScheduleApiService());
  }
  protected get endpoints() {
    return new ScheduleEndpoints();
  }
  private requestOptions(options?: ApiCallOptions): ApiCallOptions {
    return {
      ...options,
      auth: true,
      useJson: true,
      usePost: true,
      usePut: false,
      enableRetry: false,
      useStaticData: false,
    };
  }
  private validateParams(params: Params) {
    const validation = params.validate();
    if (validation.isValid) return;
    const errors: Record<string, string[]> = {};
    for (const error of validation.errors) {
      (errors[error.field] ??= []).push(error.message);
    }
    throw new ValidationException('schedule.invalid_form', errors);
  }
  private ownerParams(
    params?: Params,
    scope: 'quote' | 'timeline' = 'quote',
    allowWorkStatus = false,
  ) {
    if (
      !(params instanceof ScheduleOwnerParams) ||
      params.constructor !== ScheduleOwnerParams ||
      (params.groupId !== undefined) !== (scope === 'timeline') ||
      params.order !== undefined ||
      (!allowWorkStatus && params.workStatus !== undefined)
    ) {
      throw new ValidationException('schedule.invalid_form');
    }
    this.validateParams(params);
    return params;
  }
  private groupParams(params: Params | undefined, operation: 'create' | 'update') {
    if (
      !(params instanceof ScheduleGroupParams) ||
      (params.groupId !== undefined) !== (operation === 'update') ||
      params.order !== undefined ||
      params.workStatus !== undefined
    ) {
      throw new ValidationException('schedule.invalid_form');
    }
    this.validateParams(params);
    return params;
  }
  async index(params?: Params, options?: ApiCallOptions): Promise<ApiResponse<unknown>> {
    return super.index(
      this.ownerParams(params, 'quote', true),
      this.requestOptions(options),
      false,
    );
  }
  async show(params?: Params, options?: ApiCallOptions): Promise<ApiResponse<unknown>> {
    return super.show(this.ownerParams(params, 'timeline'), this.requestOptions(options), false);
  }
  async create(params: Params, options?: ApiCallOptions): Promise<ApiResponse<unknown>> {
    return super.create(this.groupParams(params, 'create'), this.requestOptions(options), false);
  }
  async update(params?: Params, options?: ApiCallOptions): Promise<ApiResponse<unknown>> {
    return super.update(this.groupParams(params, 'update'), this.requestOptions(options), false);
  }
  async delete(params?: Params, options?: ApiCallOptions): Promise<ApiResponse<unknown>> {
    return super.delete(this.ownerParams(params, 'timeline'), this.requestOptions(options));
  }
  async sort(
    params: ChangeProjectTimelineOrderParams,
    options?: ApiCallOptions,
  ): Promise<ApiResponse<unknown>> {
    if (!(params instanceof ChangeProjectTimelineOrderParams))
      throw new ValidationException('schedule.invalid_form');
    this.validateParams(params);
    return this.custom<unknown>(
      {
        url: this.endpoints.sort,
        method: CrudType.POST,
        params,
      },
      this.requestOptions(options),
      false,
    );
  }
  async settings(
    params: ScheduleOwnerParams,
    options?: ApiCallOptions,
  ): Promise<ApiResponse<unknown>> {
    return this.custom<unknown>(
      { url: this.endpoints.settings, method: CrudType.POST, params: this.ownerParams(params) },
      this.requestOptions(options),
      false,
    );
  }
  async saveSettings(
    params: ScheduleSettingsParams,
    options?: ApiCallOptions,
  ): Promise<ApiResponse<unknown>> {
    if (
      !(params instanceof ScheduleSettingsParams) ||
      params.groupId !== undefined ||
      params.order !== undefined ||
      params.workStatus !== undefined
    ) {
      throw new ValidationException('schedule.invalid_form');
    }
    this.validateParams(params);
    return this.custom<unknown>(
      { url: this.endpoints.saveSettings, method: CrudType.POST, params },
      this.requestOptions(options),
      false,
    );
  }
  async changeApproval(params: ChangeTimelineApprovalParams): Promise<ApiResponse<unknown>> {
    if (!(params instanceof ChangeTimelineApprovalParams))
      throw new ValidationException('schedule.invalid_form');
    this.validateParams(params);
    return this.custom<unknown>(
      { url: this.endpoints.approval, method: CrudType.POST, params },
      this.requestOptions(),
      false,
    );
  }
  async changeWorkStatus(params: ChangeTimelineWorkStatusParams): Promise<ApiResponse<unknown>> {
    if (!(params instanceof ChangeTimelineWorkStatusParams))
      throw new ValidationException('schedule.invalid_form');
    this.validateParams(params);
    return this.custom<unknown>(
      { url: this.endpoints.workStatus, method: CrudType.POST, params },
      this.requestOptions(),
      false,
    );
  }
  async history(params: ScheduleOwnerParams): Promise<ApiResponse<unknown>> {
    return this.custom<unknown>(
      {
        url: this.endpoints.history,
        method: CrudType.POST,
        params: this.ownerParams(params, 'timeline'),
      },
      this.requestOptions(),
      false,
    );
  }
}
