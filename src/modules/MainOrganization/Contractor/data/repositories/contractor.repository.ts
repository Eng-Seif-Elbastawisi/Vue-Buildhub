import BaseRepository, { type RepositoryConfig } from '@/base/Domain/Repositories/baseRepository';
import ContractorModel from '../../core/models/contractor.model';
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
}
