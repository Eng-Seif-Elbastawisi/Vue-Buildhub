import BaseRepository, { type RepositoryConfig } from '@/base/Domain/Repositories/baseRepository';
import TitleInterface from '@/base/Data/Models/titleInterface';
import SubjectModel from '../../core/models/subject.model';
import SubjectApiService from '../api/subject.api-service';

/**
 * Country Repository for API data operations
 *
 * This repository handles all data access for countries,
 * including parsing API responses and error handling.
 */
export default class SubjectRepository extends BaseRepository<SubjectModel, SubjectModel[]> {
  private static instance: SubjectRepository;

  protected get apiService() {
    return SubjectApiService.getInstance();
  }

  protected get config(): RepositoryConfig {
    return {
      hasPagination: true,
      dataKey: 'data',
      paginationKey: 'meta',
    };
  }

  protected get mockItem(): SubjectModel {
    return SubjectModel.example;
  }

  protected get mockList(): SubjectModel[] {
    return [
      SubjectModel.example,
      {
        ...SubjectModel.example,
        title: 'الفيزياء',
        id: 2,
        Stage: new TitleInterface({
          id: 2,
          title: 'المرحلة الإعدادية',
        }),
      },
      {
        ...SubjectModel.example,
        title: 'الكيمياء',
        id: 3,
        Stage: new TitleInterface({
          id: 3,
          title: 'المرحلة الابتدائية',
        }),
      },
    ];
  }

  /**
   * Get singleton instance
   * @returns CountryRepository instance
   */
  static getInstance(): SubjectRepository {
    if (!SubjectRepository.instance) {
      SubjectRepository.instance = new SubjectRepository();
    }
    return SubjectRepository.instance;
  }

  protected parseItem(data: any): SubjectModel {
    return SubjectModel.fromJson(data);
  }

  protected parseList(data: any): SubjectModel[] {
    if (!Array.isArray(data)) return [];
    return data.reduce((acc: SubjectModel[], item) => {
      try {
        if (item != null) {
          acc.push(this.parseItem(item));
        }
      } catch {}
      return acc;
    }, []);
  }
}
