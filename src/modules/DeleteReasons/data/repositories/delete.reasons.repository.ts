import BaseRepository, { type RepositoryConfig } from '@/base/Domain/Repositories/baseRepository';
import DeleteResonsModel from '../../core/models/delete.reasons.model';
import DeleteResasonsApiService from '../api/delete.resons.api-service';

/**
 * Country Repository for API data operations
 *
 * This repository handles all data access for countries,
 * including parsing API responses and error handling.
 */
export default class DeleteReasonesRepository extends BaseRepository<
  DeleteResonsModel,
  DeleteResonsModel[]
> {
  private static instance: DeleteReasonesRepository;

  protected get apiService() {
    return DeleteResasonsApiService.getInstance();
  }

  protected get config(): RepositoryConfig {
    return {
      hasPagination: true,
      dataKey: 'data',
      paginationKey: 'meta',
    };
  }

  protected get mockItem(): DeleteResonsModel {
    return DeleteResonsModel.example;
  }

  protected get mockList(): DeleteResonsModel[] {
    return [DeleteResonsModel.example, DeleteResonsModel.example, DeleteResonsModel.example];
  }

  /**
   * Get singleton instance
   * @returns CountryRepository instance
   */
  static getInstance(): DeleteReasonesRepository {
    if (!DeleteReasonesRepository.instance) {
      DeleteReasonesRepository.instance = new DeleteReasonesRepository();
    }
    return DeleteReasonesRepository.instance;
  }

  protected parseItem(data: any): DeleteResonsModel {
    return DeleteResonsModel.fromJson(data);
  }

  protected parseList(data: any): DeleteResonsModel[] {
    if (!Array.isArray(data)) return [];
    return data.reduce((acc: DeleteResonsModel[], item) => {
      try {
        if (item != null) {
          acc.push(this.parseItem(item));
        }
      } catch {}
      return acc;
    }, []);
  }
}
