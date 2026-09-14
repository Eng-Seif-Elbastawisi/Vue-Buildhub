import BaseApiService, { type ApiEndpoints } from '@/base/Data/ApiService/baseApiService';
import { ItemTypesApiEndpoints } from './item.types.api.endpoints';

export default class ItemTypesApiService extends BaseApiService {
  private static instance: ItemTypesApiService;
  private readonly itemTypesEndpoints = new ItemTypesApiEndpoints();

  static getInstance(): ItemTypesApiService {
    if (!ItemTypesApiService.instance) ItemTypesApiService.instance = new ItemTypesApiService();
    return ItemTypesApiService.instance;
  }

  protected get endpoints(): Partial<ApiEndpoints> {
    return {
      index: this.itemTypesEndpoints.index,
      show: this.itemTypesEndpoints.show,
      create: this.itemTypesEndpoints.store,
      update: this.itemTypesEndpoints.update,
      delete: this.itemTypesEndpoints.delete,
    };
  }
}
