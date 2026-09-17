import BaseApiService from '@/base/Data/ApiService/baseApiService';
import type { ApiEndpoints } from '@/base/Data/ApiService/baseApiService';
import { LaborEndpoints } from './labor.api.endpoints';

export default class LaborApiService extends BaseApiService {
  private static instance: LaborApiService;

  private readonly laborEndpoints = new LaborEndpoints();

  /**
   * Singleton instance
   */
  static getInstance(): LaborApiService {
    if (!LaborApiService.instance) {
      LaborApiService.instance = new LaborApiService();
    }
    return LaborApiService.instance;
  }

  protected get endpoints(): Partial<ApiEndpoints> {
    return {
      index: this.laborEndpoints.index,
      show: this.laborEndpoints.show,
      create: this.laborEndpoints.store,
      update: this.laborEndpoints.update,
      delete: this.laborEndpoints.delete,
    };
  }
}
