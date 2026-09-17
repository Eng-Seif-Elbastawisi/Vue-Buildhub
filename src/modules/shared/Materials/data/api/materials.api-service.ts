import BaseApiService from '@/base/Data/ApiService/baseApiService';
import type {
  ApiCallOptions,
  ApiEndpoints,
  ApiResponse,
} from '@/base/Data/ApiService/baseApiService';
import { MaterialApiEndpoints } from './materials.api.endpoints';
import type Params from '@/base/Core/Params/params';

export default class MaterialApiService extends BaseApiService {
  private static instance: MaterialApiService;

  private readonly MaterialEndpoints = new MaterialApiEndpoints();

  static getInstance(): MaterialApiService {
    if (!MaterialApiService.instance) {
      MaterialApiService.instance = new MaterialApiService();
    }
    return MaterialApiService.instance;
  }

  protected get endpoints(): Partial<ApiEndpoints> {
    return {
      index: this.MaterialEndpoints.index,
      show: this.MaterialEndpoints.show,
      create: this.MaterialEndpoints.store,
      update: this.MaterialEndpoints.update,
      delete: this.MaterialEndpoints.delete,
    };
  }

  async fetchStats(params: Params, options?: ApiCallOptions): Promise<ApiResponse> {
    return this.customPost(this.MaterialEndpoints.fetchStats, params, options);
  }
}
