import BaseApiService from '@/base/Data/ApiService/baseApiService';
import type { ApiEndpoints } from '@/base/Data/ApiService/baseApiService';
import { SupplyApiEndpoints } from './supply.api.endpoints';

export default class SupplyApiService extends BaseApiService {
  private static instance: SupplyApiService;

  private readonly supplyEndpoints = new SupplyApiEndpoints();

  static getInstance(): SupplyApiService {
    if (!SupplyApiService.instance) {
      SupplyApiService.instance = new SupplyApiService();
    }
    return SupplyApiService.instance;
  }

  protected get endpoints(): Partial<ApiEndpoints> {
    return {
      index: this.supplyEndpoints.index,
      show: this.supplyEndpoints.show,
      create: this.supplyEndpoints.store,
      update: this.supplyEndpoints.update,
      delete: this.supplyEndpoints.delete,
    };
  }
}
