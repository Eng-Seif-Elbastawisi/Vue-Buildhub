import BaseRepository, { type RepositoryConfig } from '@/base/Domain/Repositories/baseRepository';

import OrganizationModel from '../../core/models/organization.model';
import OrganizationApiService from '../api/organization.api-service';
import OrganizationShowModel from '../../core/models/organization.show.model';

export default class OrganizationRepository extends BaseRepository<
  OrganizationShowModel,
  OrganizationModel[]
> {
  private static instance: OrganizationRepository;

  protected get apiService() {
    return OrganizationApiService.getInstance();
  }

  protected get config(): RepositoryConfig {
    return {
      hasPagination: true,
      dataKey: 'data',
      paginationKey: 'meta',
    };
  }

  protected get mockItem(): OrganizationShowModel {
    return OrganizationShowModel.example;
  }

  protected get mockList(): OrganizationModel[] {
    return [{ ...OrganizationModel.example }, { ...OrganizationModel.example }];
  }

  static getInstance(): OrganizationRepository {
    if (!OrganizationRepository.instance) {
      OrganizationRepository.instance = new OrganizationRepository();
    }
    return OrganizationRepository.instance;
  }

  protected parseItem(data: any): OrganizationShowModel {
    return OrganizationShowModel.fromJson(data);
  }

  protected parseList(data: any): OrganizationModel[] {
    if (!Array.isArray(data)) return [];

    return data.map((item) => OrganizationModel.fromJson(item));
  }
}
