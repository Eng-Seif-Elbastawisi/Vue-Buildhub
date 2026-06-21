import BaseApiService, { type ApiEndpoints } from '@/base/Data/ApiService/baseApiService';
import { ItemApiEndpoints } from './Item.api.endpoints';

export default class ItemApiService extends BaseApiService {
  private static instance: ItemApiService;

  private readonly itemEndpoints = new ItemApiEndpoints();

  static getInstance(): ItemApiService {
    if (!ItemApiService.instance) {
      ItemApiService.instance = new ItemApiService();
    }
    return ItemApiService.instance;
  }

  protected get endpoints(): Partial<ApiEndpoints> {
    return {
      index: this.itemEndpoints.index,
      show: this.itemEndpoints.show,
      create: this.itemEndpoints.store,
      update: this.itemEndpoints.update,
      delete: this.itemEndpoints.delete,
    };
  }
}
