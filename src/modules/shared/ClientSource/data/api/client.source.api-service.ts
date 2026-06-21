import BaseApiService from '@/base/Data/ApiService/baseApiService';
import type { ApiEndpoints } from '@/base/Data/ApiService/baseApiService';
import { ClientSourceEndpoints } from './client.source.api.endpoints';

export default class ClientSourceApiService extends BaseApiService {
  private static instance: ClientSourceApiService;

  private readonly clientSourceEndpoints = new ClientSourceEndpoints();

  /**
   * Singleton instance
   */
  static getInstance(): ClientSourceApiService {
    if (!ClientSourceApiService.instance) {
      ClientSourceApiService.instance = new ClientSourceApiService();
    }
    return ClientSourceApiService.instance;
  }

  protected get endpoints(): Partial<ApiEndpoints> {
    return {
      index: this.clientSourceEndpoints.index,
      show: this.clientSourceEndpoints.show,
      create: this.clientSourceEndpoints.store,
      update: this.clientSourceEndpoints.update,
      delete: this.clientSourceEndpoints.delete,
    };
  }
}
