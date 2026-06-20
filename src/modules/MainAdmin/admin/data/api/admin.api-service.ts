import BaseApiService from '@/base/Data/ApiService/baseApiService';
import type { ApiEndpoints } from '@/base/Data/ApiService/baseApiService';
import { AdminEndpoints } from './admin.api.endpoints';

export default class AdminApiService extends BaseApiService {
  private static instance: AdminApiService;

  private readonly adminEndpoints = new AdminEndpoints();

  /**
   * Singleton instance
   */
  static getInstance(): AdminApiService {
    if (!AdminApiService.instance) {
      AdminApiService.instance = new AdminApiService();
    }
    return AdminApiService.instance;
  }

  protected get endpoints(): Partial<ApiEndpoints> {
    return {
      index: this.adminEndpoints.index,
      show: this.adminEndpoints.show,
      create: this.adminEndpoints.store,
      update: this.adminEndpoints.update,
      delete: this.adminEndpoints.delete,
    };
  }
}
