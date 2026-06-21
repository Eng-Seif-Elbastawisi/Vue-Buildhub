import BaseRepository, { type RepositoryConfig } from '@/base/Domain/Repositories/baseRepository';
import BrandModel from '../../core/models/brand.model';
import BrandApiService from '../api/brand.api-service';
import BrandShowModel from '../../core/models/brand.show.model';

export default class BrandRepository extends BaseRepository<BrandShowModel, BrandModel[]> {
  private static instance: BrandRepository;

  protected get apiService() {
    return BrandApiService.getInstance();
  }

  protected get config(): RepositoryConfig {
    return {
      hasPagination: true,
      dataKey: 'data',
      paginationKey: 'meta',
    };
  }

  protected get mockItem(): BrandShowModel {
    return BrandShowModel.example;
  }

  protected get mockList(): BrandModel[] {
    return [{ ...BrandModel.example }, { ...BrandModel.example }];
  }

  static getInstance(): BrandRepository {
    if (!BrandRepository.instance) {
      BrandRepository.instance = new BrandRepository();
    }
    return BrandRepository.instance;
  }

  protected parseItem(data: any): BrandShowModel {
    return BrandShowModel.fromJson(data);
  }

  protected parseList(data: any): BrandModel[] {
    if (!Array.isArray(data)) return [];

    return data.map((item) => BrandModel.fromJson(item));
  }
}
