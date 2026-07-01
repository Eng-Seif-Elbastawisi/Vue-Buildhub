import BaseApiService from '@/base/Data/ApiService/baseApiService';
import type { ApiEndpoints } from '@/base/Data/ApiService/baseApiService';
import { OrganizationEndpoints } from './organization.toggl.api.endpoints';

export default class OrganizationApiService extends BaseApiService {
  private static instance: OrganizationApiService;

  private readonly OrganizationEndpoints = new OrganizationEndpoints();

  static getInstance(): OrganizationApiService {
    if (!OrganizationApiService.instance) {
      OrganizationApiService.instance = new OrganizationApiService();
    }
    return OrganizationApiService.instance;
  }

  protected get endpoints(): Partial<ApiEndpoints> {
    return {
      show: this.OrganizationEndpoints.show,
      create: this.OrganizationEndpoints.store,
    };
  }
}
