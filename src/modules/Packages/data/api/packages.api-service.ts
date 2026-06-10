import BaseApiService from '@/base/Data/ApiService/baseApiService';
import type { ApiEndpoints } from '@/base/Data/ApiService/baseApiService';
import { ArticleEndpoints } from './packages.api.endpoints'; 

export default class PackagesApiService extends BaseApiService {
  private static instance: PackagesApiService;

  private readonly packagesEndpoints = new ArticleEndpoints();

  /**
   * Singleton instance
   */
  static getInstance(): PackagesApiService {
    if (!PackagesApiService.instance) {
      PackagesApiService.instance = new PackagesApiService();
    }
    return PackagesApiService.instance;
  }

  protected get endpoints(): Partial<ApiEndpoints> {
    return {
      index: this.packagesEndpoints.index,
      show: this.packagesEndpoints.show,
      create: this.packagesEndpoints.store,
      update: this.packagesEndpoints.update,
      delete: this.packagesEndpoints.delete,
    };
  }
}
