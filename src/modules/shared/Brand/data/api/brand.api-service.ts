import BaseApiService from '@/base/Data/ApiService/baseApiService';
import type { ApiEndpoints } from '@/base/Data/ApiService/baseApiService';
import { BrandApiEndpoints } from './brand.api.endpoints';

export default class BrandApiService extends BaseApiService {
  private static instance: BrandApiService;

  private readonly BrandEndpoints = new BrandApiEndpoints();

  static getInstance(): BrandApiService {
    if (!BrandApiService.instance) {
      BrandApiService.instance = new BrandApiService();
    }
    return BrandApiService.instance;
  }

  protected get endpoints(): Partial<ApiEndpoints> {
    return {
      index: this.BrandEndpoints.index,
      show: this.BrandEndpoints.show,
      create: this.BrandEndpoints.store,
      update: this.BrandEndpoints.update,
      delete: this.BrandEndpoints.delete,
    };
  }
}
