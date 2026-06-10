import BaseApiService from '@/base/Data/ApiService/baseApiService';
import type { ApiEndpoints } from '@/base/Data/ApiService/baseApiService';
import { DeleteAccountsEndpoints } from './delete.accounts.api.endpoints';

export default class DeleteAccountsApiService extends BaseApiService {
  private static instance: DeleteAccountsApiService;

  private readonly deleteAccountsEndpoints = new DeleteAccountsEndpoints();

  /**
   * Singleton instance
   */
  static getInstance(): DeleteAccountsApiService {
    if (!DeleteAccountsApiService.instance) {
      DeleteAccountsApiService.instance = new DeleteAccountsApiService();
    }
    return DeleteAccountsApiService.instance;
  }

  protected get endpoints(): Partial<ApiEndpoints> {
    return {
      index: this.deleteAccountsEndpoints.index,
   
    };
  }

 
}
