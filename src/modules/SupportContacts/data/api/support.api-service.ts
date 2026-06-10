import BaseApiService from '@/base/Data/ApiService/baseApiService';
import type { ApiEndpoints } from '@/base/Data/ApiService/baseApiService';
import { SupportContactsEndpoints } from './support.api.endpoints';

export default class SupportContactsApiService extends BaseApiService {
  private static instance: SupportContactsApiService;

  private readonly supportContactsEndpoints = new SupportContactsEndpoints();

  /**
   * Singleton instance
   */
  static getInstance(): SupportContactsApiService {
    if (!SupportContactsApiService.instance) {
      SupportContactsApiService.instance = new SupportContactsApiService();
    }
    return SupportContactsApiService.instance;
  }

  protected get endpoints(): Partial<ApiEndpoints> {
    return {
      index: this.supportContactsEndpoints.index,
      show: this.supportContactsEndpoints.show,
      create: this.supportContactsEndpoints.store,
      update: this.supportContactsEndpoints.update,
      delete: this.supportContactsEndpoints.delete,
    };
  }
}
