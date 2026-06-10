import BaseRepository, { type RepositoryConfig } from '@/base/Domain/Repositories/baseRepository';
import EducationConfigurationApiService from '../../api/education.configuration/education.configuration.api-service';
import EducationConfigurationModel from '@/modules/EducationClassification/core/models/EducationConfiguration/education.configuration.model';

export default class EducationConfigurationRepository extends BaseRepository<EducationConfigurationModel> {
  private static instance: EducationConfigurationRepository;

  protected get apiService() {
    return EducationConfigurationApiService.getInstance();
  }

  protected get config(): RepositoryConfig {
    return {
      hasPagination: false,
      dataKey: 'data',
      paginationKey: 'meta',
    };
  }

  protected get mockItem(): EducationConfigurationModel {
    return EducationConfigurationModel.example;
  }

  protected get mockList(): EducationConfigurationModel[] {
    return [EducationConfigurationModel.example];
  }

  static getInstance(): EducationConfigurationRepository {
    if (!EducationConfigurationRepository.instance) {
      EducationConfigurationRepository.instance = new EducationConfigurationRepository();
    }
    return EducationConfigurationRepository.instance;
  }

  protected parseItem(data: Record<string, unknown>): EducationConfigurationModel {
    return EducationConfigurationModel.fromJson(data);
  }

  protected parseList(data: Record<string, unknown>): EducationConfigurationModel[] {
    if (Array.isArray(data)) {
      return data.map((el) => EducationConfigurationModel.fromJson(el));
    }
    return [EducationConfigurationModel.fromJson(data)];
  }
}
