import BaseApiService from '@/base/Data/ApiService/baseApiService';
import type { ApiEndpoints } from '@/base/Data/ApiService/baseApiService';
import { EducationSkillsEndpoints } from './education.skills.api.endpoints';

export default class EducationSkillsApiService extends BaseApiService {
  private static instance: EducationSkillsApiService;

  private readonly educationSkillsEndpoints = new EducationSkillsEndpoints();

  static getInstance(): EducationSkillsApiService {
    if (!EducationSkillsApiService.instance) {
      EducationSkillsApiService.instance = new EducationSkillsApiService();
    }
    return EducationSkillsApiService.instance;
  }

  protected get endpoints(): Partial<ApiEndpoints> {
    return {
      create: this.educationSkillsEndpoints.store,
      update: this.educationSkillsEndpoints.update,
      delete: this.educationSkillsEndpoints.delete,
      index: this.educationSkillsEndpoints.index,
      show: this.educationSkillsEndpoints.show,
    };
  }
}
