import BaseApiService from '@/base/Data/ApiService/baseApiService';
import type { ApiEndpoints } from '@/base/Data/ApiService/baseApiService';
import { EducationTopicsEndpoints } from './education.topic.api.endpoints';

export default class EducationTopicsApiService extends BaseApiService {
  private static instance: EducationTopicsApiService;

  private readonly educationTopicsEndpoints = new EducationTopicsEndpoints();

  static getInstance(): EducationTopicsApiService {
    if (!EducationTopicsApiService.instance) {
      EducationTopicsApiService.instance = new EducationTopicsApiService();
    }
    return EducationTopicsApiService.instance;
  }

  protected get endpoints(): Partial<ApiEndpoints> {
    return {
      create: this.educationTopicsEndpoints.store,
      update: this.educationTopicsEndpoints.update,
      delete: this.educationTopicsEndpoints.delete,
      index: this.educationTopicsEndpoints.index,
      show: this.educationTopicsEndpoints.show,
    };
  }
}
