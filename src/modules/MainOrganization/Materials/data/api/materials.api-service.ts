import BaseApiService from "@/base/Data/ApiService/baseApiService";
import type { ApiEndpoints } from "@/base/Data/ApiService/baseApiService";
import { MaterialApiEndpoints } from "./materials.api.endpoints";

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
}
