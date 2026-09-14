import BaseRepository, { type RepositoryConfig } from '@/base/Domain/Repositories/baseRepository';
import ItemTypesModel from '../../core/models/item.types.model';
import ItemTypesShowModel from '../../core/models/item.types.show.model';
import ItemTypesApiService from '../api/item.types.api-service';

export default class ItemTypesRepository extends BaseRepository<
  ItemTypesShowModel,
  ItemTypesModel[]
> {
  private static instance: ItemTypesRepository;
  protected get apiService() {
    return ItemTypesApiService.getInstance();
  }
  protected get config(): RepositoryConfig {
    return { hasPagination: true, dataKey: 'data', paginationKey: 'meta' };
  }
  protected get mockItem() {
    return ItemTypesShowModel.example;
  }
  protected get mockList() {
    return [ItemTypesModel.example];
  }

  static getInstance(): ItemTypesRepository {
    if (!ItemTypesRepository.instance) ItemTypesRepository.instance = new ItemTypesRepository();
    return ItemTypesRepository.instance;
  }

  protected parseItem(data: Record<string, unknown>): ItemTypesShowModel {
    return ItemTypesShowModel.fromJson(data);
  }
  protected parseList(data: unknown): ItemTypesModel[] {
    return Array.isArray(data) ? data.map((item) => ItemTypesModel.fromJson(item)) : [];
  }
}
