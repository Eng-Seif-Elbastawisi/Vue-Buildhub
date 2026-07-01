import BaseApiService, { type ApiEndpoints } from '@/base/Data/ApiService/baseApiService';
import { SystemIdentityApiEndpoints } from './system.identity.api.endpoints';

export default class SystemIdentityApiService extends BaseApiService {
  private static instance: SystemIdentityApiService;

  private readonly systemIdentityEndpoints = new SystemIdentityApiEndpoints();

  static getInstance(): SystemIdentityApiService {
    if (!SystemIdentityApiService.instance) {
      SystemIdentityApiService.instance = new SystemIdentityApiService();
    }

    return SystemIdentityApiService.instance;
  }

  protected get endpoints(): Partial<ApiEndpoints> {
    return {
      show: this.systemIdentityEndpoints.show,
      create: this.systemIdentityEndpoints.store,
    };
  }
}
