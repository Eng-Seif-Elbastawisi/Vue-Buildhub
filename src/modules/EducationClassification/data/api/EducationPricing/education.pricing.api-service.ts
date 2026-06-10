import BaseApiService from '@/base/Data/ApiService/baseApiService';
import type { ApiEndpoints } from '@/base/Data/ApiService/baseApiService';
import { EducationPricingEndpoints } from './education.pricing.api.endpoints';

export default class EducationPricingApiService extends BaseApiService {
  private static instance: EducationPricingApiService;

  private readonly educationPricingEndpoints = new EducationPricingEndpoints();

  /**
   * Singleton instance
   */
  static getInstance(): EducationPricingApiService {
    if (!EducationPricingApiService.instance) {
      EducationPricingApiService.instance = new EducationPricingApiService();
    }
    return EducationPricingApiService.instance;
  }

  protected get endpoints(): Partial<ApiEndpoints> {
    return {
      create: this.educationPricingEndpoints.store,
      update: this.educationPricingEndpoints.update,
      delete: this.educationPricingEndpoints.delete,
      index: this.educationPricingEndpoints.index,
      show: this.educationPricingEndpoints.show,
    };
  }
}
