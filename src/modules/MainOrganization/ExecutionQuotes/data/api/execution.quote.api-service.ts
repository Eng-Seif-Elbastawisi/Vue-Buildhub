import type Params from '@/base/Core/Params/params';
import BaseApiService, {
  type ApiEndpoints,
  type ApiResponse,
} from '@/base/Data/ApiService/baseApiService';

import type ChangeQuoteStatusParams from '../../core/params/change.quote.status.params';
import type DeleteExecutionQuoteItemParams from '../../core/params/delete.execution.quote.item.params';
import type FetchQuoteStatusHistoryParams from '../../core/params/fetch.quote.status.history.params';
import type StoreExecutionQuoteDetailsParams from '../../core/params/store.execution.quote.details.params';
import type SetExecutionQuoteStagePricingParams from '../../core/params/set.execution.quote.stage.pricing.params';
import type UpdateExecutionQuoteItemParams from '../../core/params/update.execution.quote.item.params';
import type SetExecutionQuoteSupervisionPricingParams from '../../core/params/set.execution.quote.supervision.pricing.params';
import { ExecutionQuoteApiEndpoints } from './execution.quote.api.endpoints';

export interface ExecutionQuoteDetailsResponse {
  status?: boolean;
  message?: string;
  data?: unknown;
}

export interface ExecutionQuoteStatusHistoryResponse {
  status: boolean;
  message?: string;
  data: Record<string, unknown>[];
}

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

  async storeDetails(
    params?: StoreExecutionQuoteDetailsParams,
  ): Promise<ApiResponse<ExecutionQuoteDetailsResponse>> {
    return await this.customPost<ExecutionQuoteDetailsResponse>(
      this.executionQuoteEndpoints.storeDetails,
      params as Params,
      { useJson: true },
    );
  }

  async setStagePricing(
    params?: SetExecutionQuoteStagePricingParams,
  ): Promise<ApiResponse<ExecutionQuoteDetailsResponse>> {
    return await this.customPost<ExecutionQuoteDetailsResponse>(
      this.executionQuoteEndpoints.setStagePricing,
      params as Params,
      { useJson: true },
    );
  }

  async updateExecutionQuoteItem(
    params: UpdateExecutionQuoteItemParams,
  ): Promise<ApiResponse<ExecutionQuoteDetailsResponse>> {
    return await this.customPost<ExecutionQuoteDetailsResponse>(
      this.executionQuoteEndpoints.editQuoteItem,
      params,
      { useJson: true },
    );
  }

  async deleteExecutionQuoteItem(
    params: DeleteExecutionQuoteItemParams,
  ): Promise<ApiResponse<ExecutionQuoteDetailsResponse | undefined>> {
    return await this.customPost<ExecutionQuoteDetailsResponse | undefined>(
      this.executionQuoteEndpoints.deleteQuoteItem,
      params,
      { useJson: true },
    );
  }

  async setSupervisionPricing(
    params?: SetExecutionQuoteSupervisionPricingParams,
  ): Promise<ApiResponse<ExecutionQuoteDetailsResponse>> {
    return await this.customPost<ExecutionQuoteDetailsResponse>(
      this.executionQuoteEndpoints.setSupervisionPricing,
      params as Params,
      { useJson: true },
    );
  }

  async changeQuoteStatus(
    params: ChangeQuoteStatusParams,
  ): Promise<ApiResponse<ExecutionQuoteDetailsResponse>> {
    return await this.customPost<ExecutionQuoteDetailsResponse>(
      this.executionQuoteEndpoints.changeQuoteStatus,
      params,
      { useJson: true },
    );
  }

  async fetchQuoteStatusHistory(
    params: FetchQuoteStatusHistoryParams,
  ): Promise<ApiResponse<ExecutionQuoteStatusHistoryResponse>> {
    return await this.customPost<ExecutionQuoteStatusHistoryResponse>(
      this.executionQuoteEndpoints.fetchQuoteStatusHistory,
      params,
      { useJson: true },
    );
  }
}
