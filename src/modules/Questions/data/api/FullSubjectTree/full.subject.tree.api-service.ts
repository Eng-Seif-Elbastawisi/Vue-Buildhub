import BaseApiService from '@/base/Data/ApiService/baseApiService';
import type { ApiEndpoints } from '@/base/Data/ApiService/baseApiService';
import { FullSubjectTreeApiEndpoints } from './full.subject.tree.api.endpoints';

export default class FullSubjectTreeApiService extends BaseApiService {
  private static instance: FullSubjectTreeApiService;

  private readonly fullSubjectTreeApiEndpoints = new FullSubjectTreeApiEndpoints();

  /**
   * Singleton instance
   */
  static getInstance(): FullSubjectTreeApiService {
    if (!FullSubjectTreeApiService.instance) {
      FullSubjectTreeApiService.instance = new FullSubjectTreeApiService();
    }
    return FullSubjectTreeApiService.instance;
  }

  protected get endpoints(): Partial<ApiEndpoints> {
    return {
      index: this.fullSubjectTreeApiEndpoints.index,
    };
  }
}
