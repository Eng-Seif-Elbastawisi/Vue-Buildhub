import BaseApiService, { type ApiEndpoints } from '@/base/Data/ApiService/baseApiService';
import { ExecutionQuoteApiEndpoints } from './execution.quote.api.endpoints';

export default class ExecutionQuoteApiService extends BaseApiService {
  private static instance: ExecutionQuoteApiService;
  private readonly executionQuoteEndpoints = new ExecutionQuoteApiEndpoints();

  static getInstance(): ExecutionQuoteApiService {
    if (!ExecutionQuoteApiService.instance) {
      ExecutionQuoteApiService.instance = new ExecutionQuoteApiService();
    }

    return ExecutionQuoteApiService.instance;
  }

  protected get endpoints(): Partial<ApiEndpoints> {
    return {
      index: this.executionQuoteEndpoints.index,
      show: this.executionQuoteEndpoints.show,
      create: this.executionQuoteEndpoints.store,
      update: this.executionQuoteEndpoints.update,
      delete: this.executionQuoteEndpoints.delete,
    };
  }
}
