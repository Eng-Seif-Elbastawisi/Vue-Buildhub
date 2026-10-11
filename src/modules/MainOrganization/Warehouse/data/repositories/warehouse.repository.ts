import BaseRepository, { type RepositoryConfig } from '@/base/Domain/Repositories/baseRepository';
import WarehouseModel from '../../core/models/warehouse.model';
import WarehouseShowModel from '../../core/models/warehouse.show.model';
import WarehouseApiService from '../api/warehouse.api-service';

export default class WarehouseRepository extends BaseRepository<
  WarehouseShowModel,
  WarehouseModel[]
> {
  private static instance: WarehouseRepository;
  protected get apiService() {
    return WarehouseApiService.getInstance();
  }
  protected get config(): RepositoryConfig {
    return { hasPagination: true, dataKey: 'data', paginationKey: 'meta' };
  }
  protected get mockItem() {
    return WarehouseShowModel.example;
  }
  protected get mockList() {
    return [WarehouseModel.example];
  }

  static getInstance(): WarehouseRepository {
    if (!WarehouseRepository.instance) WarehouseRepository.instance = new WarehouseRepository();
    return WarehouseRepository.instance;
  }

  protected parseItem(data: Record<string, unknown>): WarehouseShowModel {
    return WarehouseShowModel.fromJson(data);
  }
  protected parseList(data: unknown): WarehouseModel[] {
    return Array.isArray(data) ? data.map((item) => WarehouseModel.fromJson(item)) : [];
  }
}
