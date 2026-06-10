import BaseRepository, { type RepositoryConfig } from '@/base/Domain/Repositories/baseRepository';
import FaqsModel from '../../core/models/faqs.model';
import FaqsApiService from '../api/faqs.api-service';

/**
 * Country Repository for API data operations
 *
 * This repository handles all data access for countries,
 * including parsing API responses and error handling.
 */
export default class FaqsRepository extends BaseRepository<FaqsModel, FaqsModel[]> {
  private static instance: FaqsRepository;

  protected get apiService() {
    return FaqsApiService.getInstance();
  }

  protected get config(): RepositoryConfig {
    return {
      hasPagination: true,
      dataKey: 'data',
      paginationKey: 'meta',
    };
  }

  protected get mockItem(): FaqsModel {
    return FaqsModel.example;
  }

  protected get mockList(): FaqsModel[] {
    return [FaqsModel.example];
  }

  /**
   * Get singleton instance
   * @returns CountryRepository instance
   */
  static getInstance(): FaqsRepository {
    if (!FaqsRepository.instance) {
      FaqsRepository.instance = new FaqsRepository();
    }
    return FaqsRepository.instance;
  }

  protected parseItem(data: any): FaqsModel {
    return FaqsModel.fromJson(data);
  }

  protected parseList(data: any): FaqsModel[] {
    if (!Array.isArray(data)) return [];
    return data.reduce((acc: FaqsModel[], item) => {
      try {
        if (item != null) {
          acc.push(this.parseItem(item));
        }
      } catch {}
      return acc;
    }, []);
  }
}
