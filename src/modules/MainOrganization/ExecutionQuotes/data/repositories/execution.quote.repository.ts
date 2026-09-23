import type { DataState } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import BaseRepository, { type RepositoryConfig } from '@/base/Domain/Repositories/baseRepository';

import ExecutionQuoteModel from '../../core/models/execution.quote.model';
import type StoreExecutionQuoteDetailsParams from '../../core/params/store.execution.quote.details.params';
import ExecutionQuoteApiService from '../api/execution.quote.api-service';

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
    return await this.apiService.storeDetails(data);
  }
}
