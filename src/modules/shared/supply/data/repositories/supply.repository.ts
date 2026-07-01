import BaseRepository, { type RepositoryConfig } from '@/base/Domain/Repositories/baseRepository';
import SupplyApiService from '../api/supply.api-service';
import SupplyModel from '../../core/models/supply.model';
import SupplyShowModel from '../../core/models/supply.show.model';

export default class SupplyRepository extends BaseRepository<SupplyShowModel, SupplyModel[]> {
  private static instance: SupplyRepository;

  protected get apiService() {
    return SupplyApiService.getInstance();
  }

  protected get config(): RepositoryConfig {
    return {
      hasPagination: true,
      dataKey: 'data',
      paginationKey: 'meta',
    };
  }

  protected get mockItem(): SupplyShowModel {
    return SupplyShowModel.example;
  }

  protected get mockList(): SupplyModel[] {
    return [{ ...SupplyModel.example }, { ...SupplyModel.example }];
  }

  static getInstance(): SupplyRepository {
    if (!SupplyRepository.instance) {
      SupplyRepository.instance = new SupplyRepository();
    }
    return SupplyRepository.instance;
  }

  protected parseItem(data: any): SupplyShowModel {
    return SupplyShowModel.fromJson(data);
  }

  protected parseList(data: any): SupplyModel[] {
    if (!Array.isArray(data)) return [];

    return data.map((item) => SupplyModel.fromJson(item));
  }
}
