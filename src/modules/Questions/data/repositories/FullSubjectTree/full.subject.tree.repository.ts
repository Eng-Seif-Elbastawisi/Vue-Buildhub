import BaseRepository, { type RepositoryConfig } from '@/base/Domain/Repositories/baseRepository';
import StageModel from '@/modules/Stages/core/models/stage.model';
import FullSubjectTreeApiService from '../../api/FullSubjectTree/full.subject.tree.api-service';

export default class FullSubjectTreeRepository extends BaseRepository<StageModel, StageModel[]> {
  private static instance: FullSubjectTreeRepository;

  protected get apiService() {
    return FullSubjectTreeApiService.getInstance();
  }

  protected get config(): RepositoryConfig {
    return {
      hasPagination: true,
      dataKey: 'data',
      paginationKey: 'meta',
    };
  }

  protected get mockItem(): StageModel {
    return StageModel.example;
  }

  protected get mockList(): StageModel[] {
    return [StageModel.example];
  }

  static getInstance(): FullSubjectTreeRepository {
    if (!FullSubjectTreeRepository.instance) {
      FullSubjectTreeRepository.instance = new FullSubjectTreeRepository();
    }
    return FullSubjectTreeRepository.instance;
  }

  protected parseItem(data: any): StageModel {
    return StageModel.fromJson(data);
  }

  protected parseList(data: any): StageModel[] {
    if (!Array.isArray(data)) return [];
    return data.reduce((acc: StageModel[], item) => {
      try {
        if (item != null) {
          acc.push(StageModel.fromJson(item));
        }
      } catch {}
      return acc;
    }, []);
  }
}
