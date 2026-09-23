import type Params from '@/base/Core/Params/params';
import BaseApiService, { type ApiEndpoints } from '@/base/Data/ApiService/baseApiService';

import type StoreExecutionQuoteDetailsParams from '../../core/params/store.execution.quote.details.params';
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

  /**
   * Same customPost pattern used by Products for non-CRUD actions.
   */
  async storeDetails(params?: StoreExecutionQuoteDetailsParams) {
    return await this.customPost(this.executionQuoteEndpoints.storeDetails, params as Params);
  }
}
