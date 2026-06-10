import BaseRepository, { type RepositoryConfig } from '@/base/Domain/Repositories/baseRepository';
import EducationSkillsModel from '@/modules/EducationClassification/core/models/EducationSkills/education.skills.model';
import EducationSkillsApiService from '@/modules/EducationClassification/data/api/EducationSkills/education.skills.api-service';

export default class EducationSkillsRepository extends BaseRepository<
  EducationSkillsModel,
  EducationSkillsModel[]
> {
  private static instance: EducationSkillsRepository;

  protected get apiService() {
    return EducationSkillsApiService.getInstance();
  }

  protected get config(): RepositoryConfig {
    return {
      hasPagination: false,
      dataKey: 'data',
      paginationKey: 'meta',
    };
  }

  protected get mockItem(): EducationSkillsModel {
    return EducationSkillsModel.example;
  }

  protected get mockList(): EducationSkillsModel[] {
    return [{ ...EducationSkillsModel.example }];
  }

  static getInstance(): EducationSkillsRepository {
    if (!EducationSkillsRepository.instance) {
      EducationSkillsRepository.instance = new EducationSkillsRepository();
    }
    return EducationSkillsRepository.instance;
  }

  protected parseItem(data: unknown): EducationSkillsModel {
    return EducationSkillsModel.fromJson(data as Record<string, unknown>);
  }

  protected parseList(data: unknown): EducationSkillsModel[] {
    if (!Array.isArray(data)) return [];
    return data.reduce((acc: EducationSkillsModel[], item) => {
      try {
        if (item != null) acc.push(this.parseItem(item));
      } catch {}
      return acc;
    }, []);
  }
}
