import BaseRepository, { type RepositoryConfig } from '@/base/Domain/Repositories/baseRepository';
import PricePercentageModel from '../../core/models/price.percentage.model';
import PricePercentageApiService from '../api/price.percentage.api-service';

export default class PricePercentageRepository extends BaseRepository<
  PricePercentageModel,
  PricePercentageModel[]
> {
  private static instance: PricePercentageRepository;

  protected get apiService() {
    return PricePercentageApiService.getInstance();
  }

  protected get config(): RepositoryConfig {
    return {
      hasPagination: false,
      dataKey: 'data',
      paginationKey: 'meta',
    };
  }

  protected get mockItem(): PricePercentageModel {
    return PricePercentageModel.example;
  }

  protected get mockList(): PricePercentageModel[] {
    return [PricePercentageModel.example];
  }

  static getInstance(): PricePercentageRepository {
    if (!PricePercentageRepository.instance) {
      PricePercentageRepository.instance = new PricePercentageRepository();
    }

    return PricePercentageRepository.instance;
  }

  protected parseItem(payload: unknown): PricePercentageModel {
    return PricePercentageModel.fromJson(payload);
  }

  protected parseList(payload: unknown): PricePercentageModel[] {
    if (!Array.isArray(payload)) return [];

    return payload.map((entry) => PricePercentageModel.fromJson(entry));
  }
}
