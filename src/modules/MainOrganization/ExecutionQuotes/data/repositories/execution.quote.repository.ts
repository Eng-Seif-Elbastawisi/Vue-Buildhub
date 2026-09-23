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

import ExecutionQuoteModel from '../../core/models/execution.quote.model';
import type StoreExecutionQuoteDetailsParams from '../../core/params/store.execution.quote.details.params';
import ExecutionQuoteApiService, {
  type ExecutionQuoteDetailsResponse,
} from '../api/execution.quote.api-service';

export default class ExecutionQuoteRepository extends BaseRepository<
  ExecutionQuoteModel,
  ExecutionQuoteModel[]
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
    return ExecutionQuoteModel.example;
  }

  protected get mockList() {
    return [ExecutionQuoteModel.example];
  }

  static getInstance(): ExecutionQuoteRepository {
    if (!ExecutionQuoteRepository.instance) {
      ExecutionQuoteRepository.instance = new ExecutionQuoteRepository();
    }

    return ExecutionQuoteRepository.instance;
  }

  protected parseItem(rawPayload: unknown): ExecutionQuoteModel {
    return ExecutionQuoteModel.fromJson(rawPayload as Record<string, unknown>);
  }

  protected parseList(rawPayload: unknown): ExecutionQuoteModel[] {
    return Array.isArray(rawPayload)
      ? rawPayload.map((rawItem) =>
          ExecutionQuoteModel.fromJson(rawItem as Record<string, unknown>),
        )
      : [];
  }

  async storeDetails(data?: StoreExecutionQuoteDetailsParams): Promise<DataState<void>> {
    try {
      const response = await this.apiService.storeDetails(data);
      return this.parseStoreDetailsResponse(response);
    } catch (error) {
      return this.handleError<void>(error);
    }
  }

  private parseStoreDetailsResponse(
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
