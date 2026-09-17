import BaseRepository, { type RepositoryConfig } from '@/base/Domain/Repositories/baseRepository';

import type Params from '@/base/Core/Params/params';

import type { ApiCallOptions } from '@/base/Data/ApiService/baseApiService';

import {
  type DataState,
  DataSuccess,
  DataFailed,
} from '@/base/Core/NetworkStructure/Resources/dataState/dataState';

import { ErrorModel, ErrorType } from '@/base/Core/NetworkStructure/Resources/errors/errorModel';

import { env } from '@/base/Core/Config';

import QuoteTypeModel from '../../core/models/quote.types.model';

import QuoteTypeApiService from '../api/quote.types.api-service';

/**
 * Quote Type Repository for API data operations
 *
 * This repository handles all data access for quote types,
 * including parsing API responses and error handling.
 */
export default class QuoteTypeRepository extends BaseRepository<QuoteTypeModel, QuoteTypeModel[]> {
  private static instance: QuoteTypeRepository;

  protected get apiService() {
    return QuoteTypeApiService.getInstance();
  }

  protected get config(): RepositoryConfig {
    return {
      hasPagination: true,
      dataKey: 'data',
      paginationKey: 'meta',
    };
  }

  protected get mockItem(): QuoteTypeModel {
    return QuoteTypeModel.example;
  }

  protected get mockList(): QuoteTypeModel[] {
    return [
      QuoteTypeModel.example,

      {
        ...QuoteTypeModel.example,
        title: 'Quote Type 2',
        id: 2,
      },

      {
        ...QuoteTypeModel.example,
        title: 'Quote Type 3',
        id: 3,
      },
    ];
  }

  /**
   * Get singleton instance
   * @returns QuoteTypeRepository instance
   */
  static getInstance(): QuoteTypeRepository {
    if (!QuoteTypeRepository.instance) {
      QuoteTypeRepository.instance = new QuoteTypeRepository();
    }

    return QuoteTypeRepository.instance;
  }

  protected parseItem(data: any): QuoteTypeModel {
    return QuoteTypeModel.fromJson(data);
  }

  protected parseList(data: any): QuoteTypeModel[] {
    if (!Array.isArray(data)) {
      return [];
    }

    return data.reduce((acc: QuoteTypeModel[], item) => {
      try {
        if (item != null) {
          acc.push(this.parseItem(item));
        }
      } catch {}

      return acc;
    }, []);
  }

  async changeOrder(params: Params, options?: ApiCallOptions): Promise<DataState<QuoteTypeModel>> {
    if (options?.useStaticData ?? env.useStaticData) {
      return new DataSuccess<QuoteTypeModel>({
        data: this.mockItem,
      });
    }

    const retryFn = () => this.changeOrder(params, options);

    try {
      const httpResponse = await this.apiService.changeOrder(params, options);

      const isSuccess = this.isSuccessStatus(httpResponse.statusCode, httpResponse.data);

      if (isSuccess) {
        return new DataSuccess<QuoteTypeModel>({
          data: httpResponse.data?.data ? this.parseItem(httpResponse.data.data) : undefined,

          message: httpResponse.data?.message,
        });
      }

      return new DataFailed({
        error: new ErrorModel(httpResponse.data?.message ?? '', ErrorType.serviceSide),
      });
    } catch (error) {
      return this.handleError(error, retryFn);
    }
  }
}
