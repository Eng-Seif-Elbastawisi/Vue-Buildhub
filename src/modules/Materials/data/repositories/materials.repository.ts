import BaseRepository, { type RepositoryConfig } from '@/base/Domain/Repositories/baseRepository';
import BrandModel from '../../core/models/materials.model';
import MaterialApiService from '../api/materials.api-service';
import MaterialModel from '../../core/models/materials.model';
import MaterialShowModel from '../../core/models/materials.show.model';

export default class MaterialRepository extends BaseRepository<
  MaterialShowModel,
  MaterialModel[]
> {
  private static instance: MaterialRepository;

  protected get apiService() {
    return MaterialApiService.getInstance();
  }

  protected get config(): RepositoryConfig {
    return {
      hasPagination: true,
      dataKey: 'data',
      paginationKey: 'meta',
    };
  }

  protected get mockItem(): MaterialShowModel {
    return MaterialShowModel.example;
  }

  protected get mockList(): MaterialModel[] {
    return [{...MaterialModel.example }, { ...MaterialModel.example}];
  }


  static getInstance(): MaterialRepository {
    if (!MaterialRepository.instance) {
      MaterialRepository.instance = new MaterialRepository();
    }
    return MaterialRepository.instance;
  }

  protected parseItem(data: any): MaterialShowModel {
    return MaterialShowModel.fromJson(data);
  }

  protected parseList(data: any): MaterialModel[] {
    if (!Array.isArray(data)) return [];

    return data.map((item) => MaterialModel.fromJson(item));
  }
}