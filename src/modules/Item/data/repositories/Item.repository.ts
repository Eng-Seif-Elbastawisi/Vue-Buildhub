import BaseRepository, { type RepositoryConfig } from '@/base/Domain/Repositories/baseRepository';
import ItemApiService from '../api/Item.api-service';
import ItemModel from '../../core/models/Item.model';
import ItemShowModel from '../../core/models/Item.show.model';

export default class ItemRepository extends BaseRepository<ItemShowModel, ItemModel[]> {
  private static instance: ItemRepository;

  protected get apiService() {
    return ItemApiService.getInstance();
  }

  protected get config(): RepositoryConfig {
    return {
      hasPagination: true,
      dataKey: 'data',
      paginationKey: 'meta',
    };
  }

  protected get mockItem(): ItemShowModel {
    return ItemShowModel.example;
  }

  protected get mockList(): ItemModel[] {
    return [{ ...ItemModel.example }, { ...ItemModel.example }];
  }

  static getInstance(): ItemRepository {
    if (!ItemRepository.instance) {
      ItemRepository.instance = new ItemRepository();
    }
    return ItemRepository.instance;
  }

  protected parseItem(data: Record<string, unknown>): ItemShowModel {
    return ItemShowModel.fromJson(data);
  }

  protected parseList(data: unknown): ItemModel[] {
    if (!Array.isArray(data)) return [];

    return data.map((item) => ItemModel.fromJson(item));
  }
}
