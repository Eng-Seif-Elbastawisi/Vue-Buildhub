import BaseApiService from '@/base/Data/ApiService/baseApiService';
import type { ApiEndpoints } from '@/base/Data/ApiService/baseApiService';
import { FaqsEndpoints } from './faqs.api.endpoints';

export default class FaqsApiService extends BaseApiService {
  private static instance: FaqsApiService;

  private readonly faqsEndpoints = new FaqsEndpoints();

  /**
   * Singleton instance
   */
  static getInstance(): FaqsApiService {
    if (!FaqsApiService.instance) {
      FaqsApiService.instance = new FaqsApiService();
    }
    return FaqsApiService.instance;
  }

  protected get endpoints(): Partial<ApiEndpoints> {
    return {
      index: this.faqsEndpoints.index,
      show: this.faqsEndpoints.show,
      create: this.faqsEndpoints.store,
      update: this.faqsEndpoints.update,
      delete: this.faqsEndpoints.delete,
    };
  }

  // executeCountryAction(params: Params): Promise<ApiResponse> {
  //   return this.customPost(this.endpoints.create || "", params);
  // }
}
