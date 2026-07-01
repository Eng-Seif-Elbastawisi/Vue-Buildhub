import BaseApiService, { type ApiEndpoints } from '@/base/Data/ApiService/baseApiService';
import { ProjectPricingApiEndpoints } from './project.pricing.api.endpoints';

export default class ProjectPricingApiService extends BaseApiService {
  private static instance: ProjectPricingApiService;

  private readonly projectEndpoints = new ProjectPricingApiEndpoints();

  static getInstance(): ProjectPricingApiService {
    if (!ProjectPricingApiService.instance) {
      ProjectPricingApiService.instance = new ProjectPricingApiService();
    }
    return ProjectPricingApiService.instance;
  }

  protected get endpoints(): Partial<ApiEndpoints> {
    return {
      index: this.projectEndpoints.index,
      show: this.projectEndpoints.show,
      create: this.projectEndpoints.store,
      update: this.projectEndpoints.update,
      delete: this.projectEndpoints.delete,
    };
  }
}
