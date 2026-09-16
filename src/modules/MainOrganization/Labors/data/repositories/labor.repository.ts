import BaseRepository, { type RepositoryConfig } from '@/base/Domain/Repositories/baseRepository';
import LaborModel from '../../core/models/labor.model';
import LaborApiService from '../api/labor.api-service';

export default class LaborRepository extends BaseRepository<LaborModel, LaborModel[]> {
  private static instance: LaborRepository;

  protected get apiService() {
    return LaborApiService.getInstance();
  }

  protected get config(): RepositoryConfig {
    return {
      hasPagination: true,
      dataKey: 'data',
      paginationKey: 'meta',
    };
  }

  protected get mockItem(): LaborModel {
    return LaborModel.example;
  }

  protected get mockList(): LaborModel[] {
    return [LaborModel.example];
  }

  static getInstance(): LaborRepository {
    if (!LaborRepository.instance) {
      LaborRepository.instance = new LaborRepository();
    }
    return LaborRepository.instance;
  }

  protected parseItem(data: any): LaborModel {
    return LaborModel.fromJson(data);
  }

  protected parseList(data: any): LaborModel[] {
    if (!Array.isArray(data)) return [];
    return data.reduce((acc: LaborModel[], item) => {
      try {
        if (item != null) {
          acc.push(this.parseItem(item));
        }
      } catch {}
      return acc;
    }, []);
  }
}
