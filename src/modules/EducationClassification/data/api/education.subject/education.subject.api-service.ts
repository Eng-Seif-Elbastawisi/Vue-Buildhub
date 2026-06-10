import BaseApiService from '@/base/Data/ApiService/baseApiService';
import type { ApiEndpoints } from '@/base/Data/ApiService/baseApiService';
import { EducationSubjectEndpoints } from './education.subject.api.endpoints';

export default class EducationSubjectApiService extends BaseApiService {
  private static instance: EducationSubjectApiService;

  private readonly educationSubjectEndpoints = new EducationSubjectEndpoints();

  /**
   * Singleton instance
   */
  static getInstance(): EducationSubjectApiService {
    if (!EducationSubjectApiService.instance) {
      EducationSubjectApiService.instance = new EducationSubjectApiService();
    }
    return EducationSubjectApiService.instance;
  }

  protected get endpoints(): Partial<ApiEndpoints> {
    return {
      create: this.educationSubjectEndpoints.store,
      index: this.educationSubjectEndpoints.index,
    };
  }
}
