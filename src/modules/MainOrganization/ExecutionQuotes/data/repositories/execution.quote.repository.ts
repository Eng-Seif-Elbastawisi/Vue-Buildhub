import {
  DataFailed,
  DataSuccess,
  type DataState,
} from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import { ErrorModel, ErrorType } from '@/base/Core/NetworkStructure/Resources/errors/errorModel';
import type { ApiResponse } from '@/base/Data/ApiService/baseApiService';
import BaseRepository, { type RepositoryConfig } from '@/base/Domain/Repositories/baseRepository';
import { translate } from '@/locales/i18n';
import { HttpStatusCode } from 'axios';

import ExecutionQuoteShowModel from '../../core/models/execution.quote.show.model';
import type DeleteExecutionQuoteItemParams from '../../core/params/delete.execution.quote.item.params';
import type StoreExecutionQuoteDetailsParams from '../../core/params/store.execution.quote.details.params';
import type SetExecutionQuoteStagePricingParams from '../../core/params/set.execution.quote.stage.pricing.params';
import type SetExecutionQuoteSupervisionPricingParams from '../../core/params/set.execution.quote.supervision.pricing.params';
import ExecutionQuoteApiService, {
  type ExecutionQuoteDetailsResponse,
} from '../api/execution.quote.api-service';
import type UpdateExecutionQuoteItemParams from '../../core/params/update.execution.quote.item.params';

export default class ExecutionQuoteRepository extends BaseRepository<
  ExecutionQuoteShowModel,
  ExecutionQuoteShowModel[]
> {
  private static instance: ExecutionQuoteRepository;

  protected get apiService() {
    return ExecutionQuoteApiService.getInstance();
  }

  protected get config(): RepositoryConfig {
    return {
      hasPagination: true,
      dataKey: 'data',
      paginationKey: 'meta',
    };
  }

  protected get mockItem() {
    return ExecutionQuoteShowModel.example;
  }

  protected get mockList() {
    return [ExecutionQuoteShowModel.example];
  }

  static getInstance(): ExecutionQuoteRepository {
    if (!ExecutionQuoteRepository.instance) {
      ExecutionQuoteRepository.instance = new ExecutionQuoteRepository();
    }

    return ExecutionQuoteRepository.instance;
  }

  protected parseItem(rawPayload: unknown): ExecutionQuoteShowModel {
    return ExecutionQuoteShowModel.fromJson(rawPayload as Record<string, unknown>);
  }

  protected parseList(rawPayload: unknown): ExecutionQuoteShowModel[] {
    return Array.isArray(rawPayload)
      ? rawPayload.map((rawItem) =>
        ExecutionQuoteShowModel.fromJson(rawItem as Record<string, unknown>),
      )
      : [];
  }

  async storeDetails(data?: StoreExecutionQuoteDetailsParams): Promise<DataState<void>> {
    try {
      const response = await this.apiService.storeDetails(data);
      return this.parseMutationResponse(response);
    } catch (error) {
      return this.handleError<void>(error);
    }
  }

  async setStagePricing(data?: SetExecutionQuoteStagePricingParams): Promise<DataState<void>> {
    try {
      const response = await this.apiService.setStagePricing(data);
      return this.parseMutationResponse(response);
    } catch (error) {
      return this.handleError<void>(error);
    }
  }

  async updateExecutionQuoteItem(params: UpdateExecutionQuoteItemParams): Promise<DataState<void>> {
    try {
      const response = await this.apiService.updateExecutionQuoteItem(params);
      return this.parseMutationResponse(response);
    } catch (error) {
      return this.handleError<void>(error);
    }
  }

  async deleteExecutionQuoteItem(params: DeleteExecutionQuoteItemParams): Promise<DataState<void>> {
    try {
      const response = await this.apiService.deleteExecutionQuoteItem(params);
      return this.parseMutationResponse(response);
    } catch (error) {
      return this.handleError<void>(error);
    }
  }

  async setSupervisionPricing(
    data?: SetExecutionQuoteSupervisionPricingParams,
  ): Promise<DataState<void>> {
    try {
      const response = await this.apiService.setSupervisionPricing(data);
      return this.parseMutationResponse(response);
    } catch (error) {
      return this.handleError<void>(error);
    }
  }

  private parseMutationResponse(
    response: ApiResponse<ExecutionQuoteDetailsResponse | undefined>,
  ): DataState<void> {
    const payload = response.data && typeof response.data === 'object' ? response.data : undefined;
    const isSuccess =
      [
        HttpStatusCode.Ok,
        HttpStatusCode.Created,
        HttpStatusCode.Accepted,
        HttpStatusCode.NoContent,
      ].includes(response.statusCode) &&
      (payload?.status ?? true);

    if (isSuccess) {
      return new DataSuccess<void>({ message: payload?.message });
    }

    return new DataFailed<void>({
      error: new ErrorModel(
        payload?.message ?? translate('execution_quote.store_details_failed'),
        ErrorType.serviceSide,
      ),
    });
  }
}
