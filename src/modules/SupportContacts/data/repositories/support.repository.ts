import BaseRepository, { type RepositoryConfig } from '@/base/Domain/Repositories/baseRepository';
import SupportContactsApiService from '../api/support.api-service';
import SupportContactsModel from '../../core/models/support.contatcts.model';

export default class SupportContactsRepository extends BaseRepository<
  SupportContactsModel,
  SupportContactsModel[]
> {
  private static instance: SupportContactsRepository;

  protected get apiService() {
    return SupportContactsApiService.getInstance();
  }

  protected get config(): RepositoryConfig {
    return {
      hasPagination: true,
      dataKey: 'data',
      paginationKey: 'meta',
    };
  }

  protected get mockItem(): SupportContactsModel {
    return SupportContactsModel.example;
  }

  protected get mockList(): SupportContactsModel[] {
    return [SupportContactsModel.example, SupportContactsModel.example];
  }

  static getInstance(): SupportContactsRepository {
    if (!SupportContactsRepository.instance) {
      SupportContactsRepository.instance = new SupportContactsRepository();
    }
    return SupportContactsRepository.instance;
  }

  protected parseItem(data: any): SupportContactsModel {
    return SupportContactsModel.fromJson(data);
  }

  protected parseList(data: any): SupportContactsModel[] {
    if (!Array.isArray(data)) return [];
    return data.reduce((acc: SupportContactsModel[], item) => {
      try {
        if (item != null) {
          acc.push(this.parseItem(item));
        }
      } catch {}
      return acc;
    }, []);
  }
}
