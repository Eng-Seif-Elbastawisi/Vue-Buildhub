import BaseApiService, { type ApiEndpoints } from '@/base/Data/ApiService/baseApiService';
import { WarehouseApiEndpoints } from './warehouse.api.endpoints';

export default class WarehouseApiService extends BaseApiService {
  private static instance: WarehouseApiService;
  private readonly warehouseEndpoints = new WarehouseApiEndpoints();

  static getInstance(): WarehouseApiService {
    if (!WarehouseApiService.instance) WarehouseApiService.instance = new WarehouseApiService();
    return WarehouseApiService.instance;
  }

  protected get endpoints(): Partial<ApiEndpoints> {
    return {
      index: this.warehouseEndpoints.index,
      show: this.warehouseEndpoints.show,
      create: this.warehouseEndpoints.store,
      update: this.warehouseEndpoints.update,
      delete: this.warehouseEndpoints.delete,
    };
  }
}
