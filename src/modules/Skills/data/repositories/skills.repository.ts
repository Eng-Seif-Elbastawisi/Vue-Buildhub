import BaseRepository, { type RepositoryConfig } from '@/base/Domain/Repositories/baseRepository';
import SkillModel from '../../core/models/skills.model';
import SkillsApiService from '../api/skills.api-service';

export default class SkillsRepository extends BaseRepository<SkillModel, SkillModel[]> {
  private static instance: SkillsRepository;

  protected get apiService() {
    return SkillsApiService.getInstance();
  }

  protected get config(): RepositoryConfig {
    return {
      hasPagination: true,
      dataKey: 'data',
      paginationKey: 'meta',
    };
  }

  protected get mockItem(): SkillModel {
    return SkillModel.example;
  }

  protected get mockList(): SkillModel[] {
    return [SkillModel.example];
  }

  static getInstance(): SkillsRepository {
    if (!SkillsRepository.instance) {
      SkillsRepository.instance = new SkillsRepository();
    }
    return SkillsRepository.instance;
  }

  protected parseItem(data: any): SkillModel {
    return SkillModel.fromJson(data);
  }

  protected parseList(data: any): SkillModel[] {
    if (!Array.isArray(data)) return [];
    return data.reduce((acc: SkillModel[], item) => {
      try {
        if (item != null) {
          acc.push(this.parseItem(item));
        }
      } catch {}
      return acc;
    }, []);
  }
}
