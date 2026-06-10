import BaseApiService from '@/base/Data/ApiService/baseApiService';
import type { ApiEndpoints, ApiResponse } from '@/base/Data/ApiService/baseApiService';
import { EducationClassificationEndpoints } from './educationClassification.api.endpoints';
import type Params from '@/base/Core/Params/params';

export default class EducationClassificationApiService extends BaseApiService {
  private static instance: EducationClassificationApiService;

  private readonly educationClassificationEndpoints = new EducationClassificationEndpoints();

  /**
   * Singleton instance
   */
  static getInstance(): EducationClassificationApiService {
    if (!EducationClassificationApiService.instance) {
      EducationClassificationApiService.instance = new EducationClassificationApiService();
    }
    return EducationClassificationApiService.instance;
  }

  protected get endpoints(): Partial<ApiEndpoints> {
    return {
      index: this.educationClassificationEndpoints.index,
      show: this.educationClassificationEndpoints.show,
      create: this.educationClassificationEndpoints.store,
      update: this.educationClassificationEndpoints.update,
      delete: this.educationClassificationEndpoints.delete,
    };
  }

  toggleStatus(params: Params): Promise<ApiResponse> {
    return this.customPost(this.educationClassificationEndpoints.toggleStatus || '', params);
  }
}
