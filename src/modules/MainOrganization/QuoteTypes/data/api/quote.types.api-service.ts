import BaseApiService, {
  type ApiCallOptions,
  type ApiEndpoints,
  type ApiResponse,
} from '@/base/Data/ApiService/baseApiService';

import type Params from '@/base/Core/Params/params';

import { QuoteTypeEndpoints } from './quote.types.api.endpoints';

export default class QuoteTypeApiService extends BaseApiService {
  private static instance: QuoteTypeApiService;

  private readonly quoteTypeEndpoints = new QuoteTypeEndpoints();

  /**
   * Singleton instance
   */
  static getInstance(): QuoteTypeApiService {
    if (!QuoteTypeApiService.instance) {
      QuoteTypeApiService.instance = new QuoteTypeApiService();
    }

    return QuoteTypeApiService.instance;
  }

  protected get endpoints(): Partial<ApiEndpoints> {
    return {
      index: this.quoteTypeEndpoints.index,
      show: this.quoteTypeEndpoints.show,
      create: this.quoteTypeEndpoints.store,
      update: this.quoteTypeEndpoints.update,
      delete: this.quoteTypeEndpoints.delete,
    };
  }

  async changeOrder(params: Params, options?: ApiCallOptions): Promise<ApiResponse> {
    return this.customPost(this.quoteTypeEndpoints.changeOrder, params, options);
  }
}
