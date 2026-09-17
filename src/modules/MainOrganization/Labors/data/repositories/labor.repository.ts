import BaseRepository, { type RepositoryConfig } from '@/base/Domain/Repositories/baseRepository';
import LaborModel from '../../core/models/labor.model';
import LaborApiService from '../api/labor.api-service';
import laborShowModel from '../../core/models/labor.show.model';

export default class LaborRepository extends BaseRepository<laborShowModel, LaborModel[]> {
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
    protected parseItem(data: any): laborShowModel {
      return laborShowModel.fromJson(data);
    }
  
    protected parseList(data: any): LaborModel[] {
      if (!Array.isArray(data)) return [];
  
      return data.map((item) => LaborModel.fromJson(item));
    }

}
