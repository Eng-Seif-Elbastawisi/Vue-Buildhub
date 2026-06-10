import BaseApiService from '@/base/Data/ApiService/baseApiService';
import type { ApiEndpoints } from '@/base/Data/ApiService/baseApiService';
import { EducationConfigurationEndpoints } from './education.configuration.api.endpoints';

export default class EducationConfigurationApiService extends BaseApiService {
  private static instance: EducationConfigurationApiService;

  private readonly educationConfigurationEndpoints = new EducationConfigurationEndpoints();

  /**
   * Singleton instance
   */
  static getInstance(): EducationConfigurationApiService {
    if (!EducationConfigurationApiService.instance) {
      EducationConfigurationApiService.instance = new EducationConfigurationApiService();
    }
    return EducationConfigurationApiService.instance;
  }

  protected get endpoints(): Partial<ApiEndpoints> {
    return {
      create: this.educationConfigurationEndpoints.store,
      index: this.educationConfigurationEndpoints.index,
    };
  }
}
