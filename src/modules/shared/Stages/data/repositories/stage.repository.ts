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

import StageModel from '../../core/models/stage.model';
import StageApiService from '../api/stage.api-service';

export default class StageRepository extends BaseRepository<StageModel, StageModel[]> {
  private static instance: StageRepository;

  protected get apiService() {
    return StageApiService.getInstance();
  }

  protected get config(): RepositoryConfig {
    return {
      hasPagination: true,
      dataKey: 'data',
      paginationKey: 'meta',
    };
  }

  protected get mockItem(): StageModel {
    return StageModel.example;
  }

  protected get mockList(): StageModel[] {
    return [StageModel.example];
  }

  static getInstance(): StageRepository {
    if (!StageRepository.instance) {
      StageRepository.instance = new StageRepository();
    }

    return StageRepository.instance;
  }

  protected parseItem(data: any): StageModel {
    return StageModel.fromJson(data);
  }

  protected parseList(data: any): StageModel[] {
    if (!Array.isArray(data)) return [];

    return data.reduce((acc: StageModel[], item) => {
      try {
        if (item != null) {
          acc.push(this.parseItem(item));
        }
      } catch {}

      return acc;
    }, []);
  }

  async changeOrder(params: Params, options?: ApiCallOptions): Promise<DataState<StageModel>> {
    if (options?.useStaticData ?? env.useStaticData) {
      return new DataSuccess<StageModel>({
        data: this.mockItem,
      });
    }

    const retryFn = () => this.changeOrder(params, options);

    try {
      const httpResponse = await this.apiService.changeOrder(params, options);

      const isSuccess = this.isSuccessStatus(httpResponse.statusCode, httpResponse.data);

      if (isSuccess) {
        return new DataSuccess<StageModel>({
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
