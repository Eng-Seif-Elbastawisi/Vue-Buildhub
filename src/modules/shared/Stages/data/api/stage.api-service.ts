import BaseApiService, {
  type ApiCallOptions,
  type ApiEndpoints,
  type ApiResponse,
} from '@/base/Data/ApiService/baseApiService';
import type Params from '@/base/Core/Params/params';
import { StageEndpoints } from './stage.api.endpoints';

export default class StageApiService extends BaseApiService {
  private static instance: StageApiService;

  private readonly stageEndpoints = new StageEndpoints();

  /**
   * Singleton instance
   */
  static getInstance(): StageApiService {
    if (!StageApiService.instance) {
      StageApiService.instance = new StageApiService();
    }
    return StageApiService.instance;
  }

  protected get endpoints(): Partial<ApiEndpoints> {
    return {
      index: this.stageEndpoints.index,
      show: this.stageEndpoints.show,
      create: this.stageEndpoints.store,
      update: this.stageEndpoints.update,
      delete: this.stageEndpoints.delete,
    };
  }

  async changeOrder(params: Params, options?: ApiCallOptions): Promise<ApiResponse> {
    return this.customPost(
      this.stageEndpoints.changeOrder,
      params,
      options,
    );
  }
}
