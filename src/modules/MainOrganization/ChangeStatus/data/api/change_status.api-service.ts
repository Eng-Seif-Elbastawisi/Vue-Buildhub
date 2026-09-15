import BaseApiService, { type ApiEndpoints, type ApiResponse } from '@/base/Data/ApiService/baseApiService';
import { ChangeStatusApiEndpoints } from './change_status.api.endpoints';
import type Params from '@/base/Core/Params/params';

export default class ChangeStatusApiService extends BaseApiService {
  private static instance: ChangeStatusApiService;

  private readonly clientEndpoints = new ChangeStatusApiEndpoints();

  static getInstance(): ChangeStatusApiService {
    if (!ChangeStatusApiService.instance) {
      ChangeStatusApiService.instance = new ChangeStatusApiService();
    }
    return ChangeStatusApiService.instance;
  }

  protected get endpoints(): Partial<ApiEndpoints> {
    return {
      index: this.clientEndpoints.changeStatus,

    };
  }
  async changeStatus(params: Params): Promise<ApiResponse> {
    return this.customPost(
      this.clientEndpoints.changeStatus,
      params,
    );

  }

}
