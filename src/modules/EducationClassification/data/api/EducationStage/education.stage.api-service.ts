import BaseApiService from '@/base/Data/ApiService/baseApiService';
import type { ApiEndpoints } from '@/base/Data/ApiService/baseApiService';
import { EducationStageEndpoints } from './education.stages.api.endpoints';

export default class EducationStageApiService extends BaseApiService {
  private static instance: EducationStageApiService;

  private readonly educationStageEndpoints = new EducationStageEndpoints();

  static getInstance(): EducationStageApiService {
    if (!EducationStageApiService.instance) {
      EducationStageApiService.instance = new EducationStageApiService();
    }
    return EducationStageApiService.instance;
  }

  protected get endpoints(): Partial<ApiEndpoints> {
    return {
      index: this.educationStageEndpoints.index,
      create: this.educationStageEndpoints.store,
      delete: this.educationStageEndpoints.delete,
      update: this.educationStageEndpoints.update,
    };
  }
}
