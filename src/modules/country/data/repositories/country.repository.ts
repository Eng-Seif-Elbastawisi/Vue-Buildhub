import BaseRepository, { type RepositoryConfig } from '@/base/Domain/Repositories/baseRepository';
import CountryModel from '../../core/models/country.model';
import CountryApiService from '../api/country.api-service';

/**
 * Country Repository for API data operations
 *
 * This repository handles all data access for countries,
 * including parsing API responses and error handling.
 */
export default class CountryRepository extends BaseRepository<CountryModel, CountryModel[]> {
  private static instance: CountryRepository;

  protected get apiService() {
    return CountryApiService.getInstance();
  }

  protected get config(): RepositoryConfig {
    return {
      hasPagination: true,
      dataKey: 'data',
      paginationKey: 'meta',
    };
  }

  protected get mockItem(): CountryModel {
    return CountryModel.example;
  }

  protected get mockList(): CountryModel[] {
    return [
      {
        ...CountryModel.example,
        title: 'sa Countery For Test',
        code: 'eg',
        id: 2,
        flag: '/src/assets/images/egypt.png',
      },
      {
        ...CountryModel.example,
        title: 'sa Countery For Test',
        code: 'eg',
        id: 3,
        flag: '/src/assets/images/egypt.png',
      },
      {
        ...CountryModel.example,
        title: 'sa Countery For Test',
        code: 'eg',
        id: 4,
        flag: '/src/assets/images/egypt.png',
      },
      {
        ...CountryModel.example,
        title: 'sa Countery For Test',
        code: 'eg',
        id: 5,
        flag: '/src/assets/images/egypt.png',
      },
      {
        ...CountryModel.example,
        title: 'sa Countery For Test',
        code: 'eg',
        id: 6,
        flag: '/src/assets/images/egypt.png',
      },
      {
        ...CountryModel.example,
        title: 'sa Countery For Test',
        code: 'eg',
        id: 7,
        flag: '/src/assets/images/egypt.png',
      },
    ];
  }

  /**
   * Get singleton instance
   * @returns CountryRepository instance
   */
  static getInstance(): CountryRepository {
    if (!CountryRepository.instance) {
      CountryRepository.instance = new CountryRepository();
    }
    return CountryRepository.instance;
  }

  protected parseItem(data: any): CountryModel {
    return CountryModel.fromJson(data);
  }

  protected parseList(data: any): CountryModel[] {
    if (!Array.isArray(data)) return [];
    return data.reduce((acc: CountryModel[], item) => {
      try {
        if (item != null) {
          acc.push(this.parseItem(item));
        }
      } catch {}
      return acc;
    }, []);
  }
}
