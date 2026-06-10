import BaseRepository, { type RepositoryConfig } from '@/base/Domain/Repositories/baseRepository';
import EducationTopicModel from '@/modules/EducationClassification/core/models/EducationTopic/education.tpoic.model';
import ShowEducationTopicModel from '@/modules/EducationClassification/core/models/EducationTopic/show.education.tpoic.model';
import EducationTopicsApiService from '../../api/EducationTopic/education.topic.api-service';

export default class EducationTopicsRepository extends BaseRepository<
  ShowEducationTopicModel,
  EducationTopicModel[]
> {
  private static instance: EducationTopicsRepository;

  protected get apiService() {
    return EducationTopicsApiService.getInstance();
  }

  protected get config(): RepositoryConfig {
    return {
      hasPagination: false,
      dataKey: 'data',
      paginationKey: 'meta',
    };
  }

  protected get mockItem(): ShowEducationTopicModel {
    return ShowEducationTopicModel.example;
  }

  protected get mockList(): EducationTopicModel[] {
    return [{ ...EducationTopicModel.example }];
  }

  static getInstance(): EducationTopicsRepository {
    if (!EducationTopicsRepository.instance) {
      EducationTopicsRepository.instance = new EducationTopicsRepository();
    }
    return EducationTopicsRepository.instance;
  }

  protected parseItem(data: unknown): ShowEducationTopicModel {
    return ShowEducationTopicModel.fromJson(data as Record<string, unknown>);
  }

  protected parseList(data: unknown): EducationTopicModel[] {
    if (!Array.isArray(data)) return [];
    return data.reduce((acc: EducationTopicModel[], item) => {
      try {
        if (item != null) acc.push(EducationTopicModel.fromJson(item));
      } catch {}
      return acc;
    }, []);
  }
}
