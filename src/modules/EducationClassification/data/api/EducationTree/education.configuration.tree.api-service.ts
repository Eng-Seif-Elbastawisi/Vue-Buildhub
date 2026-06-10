import BaseApiService from '@/base/Data/ApiService/baseApiService';
import type { ApiEndpoints } from '@/base/Data/ApiService/baseApiService';
import { EducationTreeEndpoints } from './education.configuration.tree.api.endpoints';

export default class EducationTreeApiService extends BaseApiService {
  private static instance: EducationTreeApiService;

  private readonly educationTreeEndpoints = new EducationTreeEndpoints();

  /**
   * Singleton instance
   */
  static getInstance(): EducationTreeApiService {
    if (!EducationTreeApiService.instance) {
      EducationTreeApiService.instance = new EducationTreeApiService();
    }
    return EducationTreeApiService.instance;
  }

  protected get endpoints(): Partial<ApiEndpoints> {
    return {
      index: this.educationTreeEndpoints.index,
      create: this.educationTreeEndpoints.add,
    };
  }
}
