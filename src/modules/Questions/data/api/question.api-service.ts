import BaseApiService from '@/base/Data/ApiService/baseApiService';
import type { ApiEndpoints } from '@/base/Data/ApiService/baseApiService';
import { QuestionEndpoints } from './question.api.endpoints';

export default class QuestionApiService extends BaseApiService {
  private static instance: QuestionApiService;

  private readonly questionEndpoints = new QuestionEndpoints();

  /**
   * Singleton instance
   */
  static getInstance(): QuestionApiService {
    if (!QuestionApiService.instance) {
      QuestionApiService.instance = new QuestionApiService();
    }
    return QuestionApiService.instance;
  }

  protected get endpoints(): Partial<ApiEndpoints> {
    return {
      index: this.questionEndpoints.index,
      show: this.questionEndpoints.show,
      create: this.questionEndpoints.store,
      update: this.questionEndpoints.update,
      delete: this.questionEndpoints.delete,
    };
  }
}
