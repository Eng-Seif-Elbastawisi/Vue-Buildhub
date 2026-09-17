import BaseRepository, { type RepositoryConfig } from '@/base/Domain/Repositories/baseRepository';
import ProductsModel from '../../core/models/products.model';
import ProductsShowModel from '../../core/models/products.show.model';
import ProductsApiService from '../api/products.api-service';
import type DeleteProductsSortingParams from '../../core/params/delete.products.sorting.params';
import type DeleteProductsStageParams from '../../core/params/delete.products.stage.params';
import type StoreProductsSortingParams from '../../core/params/store.products.sorting.params';
import type StoreProductsStageParams from '../../core/params/store.products.stage.params';
import type { DataState } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';

export default class ProductsRepository extends BaseRepository<ProductsShowModel, ProductsModel[]> {
  private static instance: ProductsRepository;

  protected get apiService() {
    return ProductsApiService.getInstance();
  }

  protected get config(): RepositoryConfig {
    return {
      hasPagination: true,
      dataKey: 'data',
      paginationKey: 'meta',
    };
  }

  protected get mockItem() {
    return ProductsShowModel.example;
  }

  protected get mockList() {
    return [ProductsModel.example];
  }

  static getInstance(): ProductsRepository {
    if (!ProductsRepository.instance) {
      ProductsRepository.instance = new ProductsRepository();
    }

    return ProductsRepository.instance;
  }

  protected parseItem(data: Record<string, unknown>): ProductsShowModel {
    return ProductsShowModel.fromJson(data);
  }

  protected parseList(data: unknown): ProductsModel[] {
    return Array.isArray(data) ? data.map((item) => ProductsModel.fromJson(item)) : [];
  }

  async deleteProductSorting(data?: DeleteProductsSortingParams): Promise<DataState<void>> {
    return await this.apiService.deleteProductSorting(data);
  }

  async deleteProductStage(data?: DeleteProductsStageParams): Promise<DataState<void>> {
    return await this.apiService.deleteProductStage(data);
  }

  async storeProductSorting(data?: StoreProductsSortingParams): Promise<DataState<void>> {
    return await this.apiService.storeProductSorting(data);
  }

  async storeProductStage(data?: StoreProductsStageParams): Promise<DataState<void>> {
    return await this.apiService.storeProductStage(data);
  }
}