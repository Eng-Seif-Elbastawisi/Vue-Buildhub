import BaseApiService from "@/base/Data/ApiService/baseApiService";
import type { ApiEndpoints } from "@/base/Data/ApiService/baseApiService";
import { UnitEndpoints } from "./unit.api.endpoints";

export default class UnitApiService extends BaseApiService {
  private static instance: UnitApiService;

  private readonly unitEndpoints = new UnitEndpoints();

  /**
   * Singleton instance
   */
  static getInstance(): UnitApiService {
    if (!UnitApiService.instance) {
      UnitApiService.instance = new UnitApiService();
    }
    return UnitApiService.instance;
  }

  protected get endpoints(): Partial<ApiEndpoints> {
    return {
      index: this.unitEndpoints.index,
      show: this.unitEndpoints.show,
      create: this.unitEndpoints.store,
      update: this.unitEndpoints.update,
      delete: this.unitEndpoints.delete,
    };
  }

  // executeUnitAction(params: Params): Promise<ApiResponse> {
  //   return this.customPost(this.endpoints.create || "", params);
  // }
}
