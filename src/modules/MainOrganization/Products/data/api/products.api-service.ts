import BaseApiService, { type ApiEndpoints } from '@/base/Data/ApiService/baseApiService';
import { ProductsApiEndpoints } from './products.api.endpoints';

export default class ProductsApiService extends BaseApiService {
  private static instance: ProductsApiService;
  private readonly productsEndpoints = new ProductsApiEndpoints();

  static getInstance(): ProductsApiService {
    if (!ProductsApiService.instance)
      ProductsApiService.instance = new ProductsApiService();
    return ProductsApiService.instance;
  }

  protected get endpoints(): Partial<ApiEndpoints> {
    return {
      index: this.productsEndpoints.index,
      show: this.productsEndpoints.show,
      create: this.productsEndpoints.store,
      update: this.productsEndpoints.update,
      delete: this.productsEndpoints.delete,
      
    };
  }
}
