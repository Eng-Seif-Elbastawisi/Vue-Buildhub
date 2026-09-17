import BaseApiService, { type ApiEndpoints } from '@/base/Data/ApiService/baseApiService';
import { ProductsApiEndpoints } from './products.api.endpoints';
import type DeleteProductsSortingParams from '../../core/params/delete.products.sorting.params';
import type DeleteProductsStageParams from '../../core/params/delete.products.stage.params';
import type StoreProductsSortingParams from '../../core/params/store.products.sorting.params';
import type StoreProductsStageParams from '../../core/params/store.products.stage.params';
import type Params from '@/base/Core/Params/params';

export default class ProductsApiService extends BaseApiService {
  private static instance: ProductsApiService;
  private readonly productsEndpoints = new ProductsApiEndpoints();

  static getInstance(): ProductsApiService {
    if (!ProductsApiService.instance) ProductsApiService.instance = new ProductsApiService();
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

  async deleteProductSorting(params?: DeleteProductsSortingParams) {
    return await this.customPost(this.productsEndpoints.deleteProductSorting, params as Params);
  }

  async deleteProductStage(params?: DeleteProductsStageParams) {
    return await this.customPost(this.productsEndpoints.deleteProductStage, params as Params);
  }

  async storeProductSorting(params?: StoreProductsSortingParams) {
    return await this.customPost(this.productsEndpoints.storeProductSorting, params as Params);
  }

  async storeProductStage(params?: StoreProductsStageParams) {
    return await this.customPost(this.productsEndpoints.storeProductStage, params as Params);
  }
}
