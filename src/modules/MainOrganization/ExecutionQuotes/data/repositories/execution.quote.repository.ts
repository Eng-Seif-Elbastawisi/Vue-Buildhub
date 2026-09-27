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
import type StoreExecutionQuoteDetailsParams from '../../core/params/store.execution.quote.details.params';
import type SetExecutionQuoteStagePricingParams from '../../core/params/set.execution.quote.stage.pricing.params';
import ExecutionQuoteApiService, {
  type ExecutionQuoteDetailsResponse,
} from '../api/execution.quote.api-service';

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

  private parseMutationResponse(
    response: ApiResponse<ExecutionQuoteDetailsResponse>,
  ): DataState<void> {
    const isSuccess =
      [HttpStatusCode.Ok, HttpStatusCode.Created, HttpStatusCode.Accepted].includes(
        response.statusCode,
      ) &&
      (response.data.status ?? true);

    if (isSuccess) {
      return new DataSuccess<void>({ message: response.data.message });
    }

    return new DataFailed<void>({
      error: new ErrorModel(
        response.data.message ?? translate('execution_quote.store_details_failed'),
        ErrorType.serviceSide,
      ),
    });
  }
}
