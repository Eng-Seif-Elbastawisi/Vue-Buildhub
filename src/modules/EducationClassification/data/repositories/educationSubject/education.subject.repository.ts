import BaseRepository, { type RepositoryConfig } from '@/base/Domain/Repositories/baseRepository';
import EducationSubjectApiService from '../../api/education.subject/education.subject.api-service';
import EducationSubjectConfigurationModel from '@/modules/EducationClassification/core/models/EducationConfiguration/education.subject.configuration.model';

export default class EducationSubjectRepository extends BaseRepository<EducationSubjectConfigurationModel> {
  private static instance: EducationSubjectRepository;

  protected get apiService() {
    return EducationSubjectApiService.getInstance();
  }

  protected get config(): RepositoryConfig {
    return {
      hasPagination: false,
      dataKey: 'data',
      paginationKey: 'meta',
    };
  }

  protected get mockItem(): EducationSubjectConfigurationModel {
    return EducationSubjectConfigurationModel.example;
  }

  protected get mockList(): EducationSubjectConfigurationModel[] {
    return [EducationSubjectConfigurationModel.example];
  }

  static getInstance(): EducationSubjectRepository {
    if (!EducationSubjectRepository.instance) {
      EducationSubjectRepository.instance = new EducationSubjectRepository();
    }
    return EducationSubjectRepository.instance;
  }

  protected parseItem(data: unknown): EducationSubjectConfigurationModel {
    return EducationSubjectConfigurationModel.fromJson(data as Record<string, unknown>);
  }

  protected parseList(data: unknown): EducationSubjectConfigurationModel[] {
    if (Array.isArray(data)) {
      return data.map((el: Record<string, unknown>) =>
        EducationSubjectConfigurationModel.fromJson(el as Record<string, any>),
      );
    }
    return [EducationSubjectConfigurationModel.fromJson(data as Record<string, unknown>)];
  }
}
