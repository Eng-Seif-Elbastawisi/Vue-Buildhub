import BaseApiService from '@/base/Data/ApiService/baseApiService';
import type { ApiEndpoints } from '@/base/Data/ApiService/baseApiService';
import { ArticleEndpoints } from './Artical.api.endpoints';

export default class ArticleApiService extends BaseApiService {
  private static instance: ArticleApiService;

  private readonly articleEndpoints = new ArticleEndpoints();

  /**
   * Singleton instance
   */
  static getInstance(): ArticleApiService {
    if (!ArticleApiService.instance) {
      ArticleApiService.instance = new ArticleApiService();
    }
    return ArticleApiService.instance;
  }

  protected get endpoints(): Partial<ApiEndpoints> {
    return {
      index: this.articleEndpoints.index,
      show: this.articleEndpoints.show,
      create: this.articleEndpoints.store,
      update: this.articleEndpoints.update,
      delete: this.articleEndpoints.delete,
    };
  }
}
