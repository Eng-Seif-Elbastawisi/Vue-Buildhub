import BaseApiService from '@/base/Data/ApiService/baseApiService';
import type { ApiEndpoints } from '@/base/Data/ApiService/baseApiService';
import { CountryEndpoints } from './country.api.endpoints';

export default class CountryApiService extends BaseApiService {
  private static instance: CountryApiService;

  private readonly countryEndpoints = new CountryEndpoints();

  /**
   * Singleton instance
   */
  static getInstance(): CountryApiService {
    if (!CountryApiService.instance) {
      CountryApiService.instance = new CountryApiService();
    }
    return CountryApiService.instance;
  }

  protected get endpoints(): Partial<ApiEndpoints> {
    return {
      index: this.countryEndpoints.index,
 
    };
  }

  // executeCountryAction(params: Params): Promise<ApiResponse> {
  //   return this.customPost(this.endpoints.create || "", params);
  // }
}
