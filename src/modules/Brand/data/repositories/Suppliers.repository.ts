import BaseRepository, { type RepositoryConfig } from '@/base/Domain/Repositories/baseRepository';

import SuppliersModel from '../../core/models/brand.model';
import SuppliersApiService from '../api/Suppliers.api-service';
import SuppliersShowModel from '../../core/models/brand.show.model';

export default class SuppliersRepository extends BaseRepository<
  SuppliersShowModel,
  SuppliersModel[]
> {
  private static instance: SuppliersRepository;

  protected get apiService() {
    return SuppliersApiService.getInstance();
  }

  protected get config(): RepositoryConfig {
    return {
      hasPagination: true,
      dataKey: 'data',
      paginationKey: 'meta',
    };
  }

  protected get mockItem(): SuppliersShowModel {
    return SuppliersShowModel.example;
  }

  protected get mockList(): SuppliersModel[] {
    return [{...SuppliersModel.example }, { ...SuppliersModel.example}];
  }


  static getInstance(): SuppliersRepository {
    if (!SuppliersRepository.instance) {
      SuppliersRepository.instance = new SuppliersRepository();
    }
    return SuppliersRepository.instance;
  }

  protected parseItem(data: any): SuppliersShowModel {
    return SuppliersShowModel.fromJson(data);
  }

  protected parseList(data: any): SuppliersModel[] {
    if (!Array.isArray(data)) return [];

    return data.map((item) => SuppliersModel.fromJson(item));
  }
}