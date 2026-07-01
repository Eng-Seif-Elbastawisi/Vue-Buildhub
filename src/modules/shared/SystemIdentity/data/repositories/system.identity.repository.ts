import BaseRepository, { type RepositoryConfig } from '@/base/Domain/Repositories/baseRepository';
import SystemIdentityShowModel from '../../core/models/system.identity.show.model';
import SystemIdentityApiService from '../api/system.identity.api-service';

export default class SystemIdentityRepository extends BaseRepository<
  SystemIdentityShowModel,
  SystemIdentityShowModel[]
> {
  private static instance: SystemIdentityRepository;

  protected get apiService() {
    return SystemIdentityApiService.getInstance();
  }

  protected get config(): RepositoryConfig {
    return {
      hasPagination: false,
      dataKey: 'data',
      paginationKey: 'meta',
    };
  }

  protected get mockItem(): SystemIdentityShowModel {
    return SystemIdentityShowModel.example;
  }

  protected get mockList(): SystemIdentityShowModel[] {
    return [{ ...SystemIdentityShowModel.example }];
  }

  static getInstance(): SystemIdentityRepository {
    if (!SystemIdentityRepository.instance) {
      SystemIdentityRepository.instance = new SystemIdentityRepository();
    }

    return SystemIdentityRepository.instance;
  }

  protected parseItem(data: unknown): SystemIdentityShowModel {
    return SystemIdentityShowModel.fromJson(data);
  }

  protected parseList(data: unknown): SystemIdentityShowModel[] {
    if (!Array.isArray(data)) return [];

    return data.map((item) => SystemIdentityShowModel.fromJson(item));
  }
}
