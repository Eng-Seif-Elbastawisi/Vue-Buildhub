import BaseApiService from "@/base/Data/ApiService/baseApiService";
import type { ApiEndpoints } from "@/base/Data/ApiService/baseApiService";
import { StageEndpoints } from "./stage.api.endpoints";

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

  // executeCountryAction(params: Params): Promise<ApiResponse> {
  //   return this.customPost(this.endpoints.create || "", params);
  // }
}
