import BaseApiService from '@/base/Data/ApiService/baseApiService';
import type { ApiEndpoints } from '@/base/Data/ApiService/baseApiService';
import { SkillsEndpoints } from './skill.api.endpoints';

export default class SkillsApiService extends BaseApiService {
  private static instance: SkillsApiService;

  private readonly skillsEndpoints = new SkillsEndpoints();

  /**
   * Singleton instance
   */
  static getInstance(): SkillsApiService {
    if (!SkillsApiService.instance) {
      SkillsApiService.instance = new SkillsApiService();
    }
    return SkillsApiService.instance;
  }

  protected get endpoints(): Partial<ApiEndpoints> {
    return {
      index: this.skillsEndpoints.index,
      create: this.skillsEndpoints.store,
      show: this.skillsEndpoints.show,
      update: this.skillsEndpoints.update,
      delete: this.skillsEndpoints.delete,
    };
  }
}
