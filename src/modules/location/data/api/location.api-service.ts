import BaseApiService from "@/base/Data/ApiService/baseApiService";
import type { ApiEndpoints } from "@/base/Data/ApiService/baseApiService";
import { LocationApiEndpoints } from "./location.api.endpoints";

export default class LocationApiService extends BaseApiService {
  private static instance: LocationApiService;

  private readonly LocationEndpoints = new LocationApiEndpoints();

  static getInstance(): LocationApiService {
    if (!LocationApiService.instance) {
      LocationApiService.instance = new LocationApiService();
    }
    return LocationApiService.instance;
  }

  protected get endpoints(): Partial<ApiEndpoints> {
    return {
      index: this.LocationEndpoints.index,
      show: this.LocationEndpoints.show,
      create: this.LocationEndpoints.store,
      update: this.LocationEndpoints.update,
      delete: this.LocationEndpoints.delete,
    };
  }
}
