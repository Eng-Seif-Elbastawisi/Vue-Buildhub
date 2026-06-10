import BaseApiService from '@/base/Data/ApiService/baseApiService';
import type { ApiEndpoints } from '@/base/Data/ApiService/baseApiService';
import { EducationSubjectItemEndpoints } from './education.subject.item.api.endpoints';

export default class EducationSubjectItemApiService extends BaseApiService {
  private static instance: EducationSubjectItemApiService;

  private readonly endpoints_ = new EducationSubjectItemEndpoints();

  static getInstance(): EducationSubjectItemApiService {
    if (!EducationSubjectItemApiService.instance) {
      EducationSubjectItemApiService.instance = new EducationSubjectItemApiService();
    }
    return EducationSubjectItemApiService.instance;
  }

  protected get endpoints(): Partial<ApiEndpoints> {
    return {
      index: this.endpoints_.index,
      create: this.endpoints_.store,
      delete: this.endpoints_.delete,
      update: this.endpoints_.update,
    };
  }
}
