import BaseRepository, { type RepositoryConfig } from '@/base/Domain/Repositories/baseRepository';

import OrganizationToggledModel from '../../core/models/organization.toggle.model';
import OrganizationApiService from '../api/organization.toggl.api-service';

export default class OrganizationRepository extends BaseRepository<
  OrganizationToggledModel,
  OrganizationToggledModel[]
> {
  private static instance: OrganizationRepository;

  protected get apiService() {
    return OrganizationApiService.getInstance();
  }

  protected get config(): RepositoryConfig {
    return {
      hasPagination: false,
      dataKey: 'data',
      paginationKey: 'meta',
    };
  }

  protected get mockItem(): OrganizationToggledModel {
    return OrganizationToggledModel.example;
  }

  protected get mockList(): OrganizationToggledModel[] {
    return [{ ...OrganizationToggledModel.example }];
  }

  static getInstance(): OrganizationRepository {
    if (!OrganizationRepository.instance) {
      OrganizationRepository.instance = new OrganizationRepository();
    }
    return OrganizationRepository.instance;
  }

  protected parseItem(data: unknown): OrganizationToggledModel {
    return OrganizationToggledModel.fromJson(data);
  }

  protected parseList(data: unknown): OrganizationToggledModel[] {
    if (!Array.isArray(data)) return [];

    return data.map((item) => OrganizationToggledModel.fromJson(item));
  }
}
