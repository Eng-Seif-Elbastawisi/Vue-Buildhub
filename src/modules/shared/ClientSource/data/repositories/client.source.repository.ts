import BaseRepository, { type RepositoryConfig } from '@/base/Domain/Repositories/baseRepository';
import ClientSourceModel from '../../core/models/client.source.model';
import ClientSourceApiService from '../api/client.source.api-service';

/**
 * Country Repository for API data operations
 *
 * This repository handles all data access for countries,
 * including parsing API responses and error handling.
 */
export default class ClientSourceRepository extends BaseRepository<ClientSourceModel, ClientSourceModel[]> {
  private static instance: ClientSourceRepository;

  protected get apiService() {
    return ClientSourceApiService.getInstance();
  } 

  protected get config(): RepositoryConfig {
    return {
      hasPagination: true,
      dataKey: 'data',
      paginationKey: 'meta',
    };
  }

  protected get mockItem(): ClientSourceModel {
    return ClientSourceModel.example;
  }

  protected get mockList(): ClientSourceModel[] {
    return [
      ClientSourceModel.example,
      {
        ...ClientSourceModel.example,
        title: 'المرحلة الإعدادية',
        id: 2,
      },
      {
        ...ClientSourceModel.example,
        title: 'المرحلة الابتدائية',
        id: 3,
      },
    ];
  }

  /**
   * Get singleton instance
   * @returns CountryRepository instance
   */
  static getInstance(): ClientSourceRepository {
    if (!ClientSourceRepository.instance) {
      ClientSourceRepository.instance = new ClientSourceRepository();
    }
    return ClientSourceRepository.instance;
  }

  protected parseItem(data: any): ClientSourceModel {
    return ClientSourceModel.fromJson(data);
  }

  protected parseList(data: any): ClientSourceModel[] {
    if (!Array.isArray(data)) return [];
    return data.reduce((acc: ClientSourceModel[], item) => {
      try {
        if (item != null) {
          acc.push(this.parseItem(item));
        }
      } catch {}
      return acc;
    }, []);
  }
}
