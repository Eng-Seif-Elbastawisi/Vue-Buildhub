import BaseApiService, { type ApiEndpoints } from '@/base/Data/ApiService/baseApiService';
import { LocationApiEndpoints } from './location.api.endpoints';

export default class LocationApiService extends BaseApiService {
  private static instance: LocationApiService;

  private readonly locationEndpoints = new LocationApiEndpoints();

  static getInstance(): LocationApiService {
    if (!LocationApiService.instance) {
      LocationApiService.instance = new LocationApiService();
    }
    return LocationApiService.instance;
  }

  protected get endpoints(): Partial<ApiEndpoints> {
    return {
      index: this.locationEndpoints.index,
      show: this.locationEndpoints.show,
      create: this.locationEndpoints.store,
      update: this.locationEndpoints.update,
      delete: this.locationEndpoints.delete,
    };
  }
}
