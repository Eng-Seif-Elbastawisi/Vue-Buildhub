import BaseRepository, { type RepositoryConfig } from '@/base/Domain/Repositories/baseRepository';
import DeleteAccountsModel from '@/modules/DeleteReasons/core/models/delete.accountes.model';
import DeleteAccountsApiService from '../../api/DeleteAccounts/delete.accounts.api-service';

/**
 * Country Repository for API data operations
 *
 * This repository handles all data access for countries,
 * including parsing API responses and error handling.
 */
export default class DeleteAccountsRepository extends BaseRepository<
  DeleteAccountsModel,
  DeleteAccountsModel[]
> {
  private static instance: DeleteAccountsRepository;

  protected get apiService() {
    return DeleteAccountsApiService.getInstance();
  }

  protected get config(): RepositoryConfig {
    return {
      hasPagination: true,
      dataKey: 'data',
      paginationKey: 'meta',
    };
  }

  protected get mockItem(): DeleteAccountsModel {
    return DeleteAccountsModel.example;
  }

  protected get mockList(): DeleteAccountsModel[] {
    return [DeleteAccountsModel.example];
  }

  /**
   * Get singleton instance
   * @returns CountryRepository instance
   */
  static getInstance(): DeleteAccountsRepository {
    if (!DeleteAccountsRepository.instance) {
      DeleteAccountsRepository.instance = new DeleteAccountsRepository();
    }
    return DeleteAccountsRepository.instance;
  }

  protected parseItem(data: any): DeleteAccountsModel {
    return DeleteAccountsModel.fromJson(data);
  }

  protected parseList(data: any): DeleteAccountsModel[] {
    if (!Array.isArray(data)) return [];
    return data.reduce((acc: DeleteAccountsModel[], item) => {
      try {
        if (item != null) {
          acc.push(this.parseItem(item));
        }
      } catch {}
      return acc;
    }, []);
  }
}
