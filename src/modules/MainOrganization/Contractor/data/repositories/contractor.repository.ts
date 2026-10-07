import BaseRepository, { type RepositoryConfig } from '@/base/Domain/Repositories/baseRepository';
import {
  DataFailed,
  DataSuccess,
  type DataState,
} from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import { ErrorModel, ErrorType } from '@/base/Core/NetworkStructure/Resources/errors/errorModel';
import { HttpStatusCode } from 'axios';
import ContractorModel from '../../core/models/contractor.model';
import type DeleteContractorStageParams from '../../core/params/delete.contractor.stage.params';
import ContractorApiService from '../api/contractor.api-service';

export default class ContractorRepository extends BaseRepository<
  ContractorModel,
  ContractorModel[]
> {
  private static instance: ContractorRepository;

  protected get apiService() {
    return ContractorApiService.getInstance();
  }

  protected get config(): RepositoryConfig {
    return { hasPagination: true, dataKey: 'data', paginationKey: 'meta' };
  }

  protected get mockItem() {
    return ContractorModel.example;
  }

  protected get mockList() {
    return [ContractorModel.example];
  }

  static getInstance(): ContractorRepository {
    if (!ContractorRepository.instance) {
      ContractorRepository.instance = new ContractorRepository();
    }
    return ContractorRepository.instance;
  }

  protected parseItem(data: Record<string, unknown>): ContractorModel {
    return ContractorModel.fromJson(data);
  }

  protected parseList(data: unknown): ContractorModel[] {
    return Array.isArray(data)
      ? data.map((contractor) => ContractorModel.fromJson(contractor))
      : [];
  }

  async deleteStage(params: DeleteContractorStageParams): Promise<DataState<void>> {
    try {
      const response = await this.apiService.deleteStage(params);
      if (
        [HttpStatusCode.Ok, HttpStatusCode.Created, HttpStatusCode.Accepted].includes(
          response.statusCode,
        ) &&
        response.data.status !== false
      ) {
        return new DataSuccess<void>({ message: response.data.message });
      }

      return new DataFailed<void>({
        error: new ErrorModel(response.data.message ?? '', ErrorType.serviceSide),
      });
    } catch (error) {
      return this.handleError<void>(error);
    }
  }
}
