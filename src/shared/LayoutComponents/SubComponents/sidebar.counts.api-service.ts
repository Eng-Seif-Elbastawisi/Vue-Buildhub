import BaseApiService, { type ApiEndpoints, type ApiResponse } from '@/base/Data/ApiService/baseApiService';

import { SidebarCountsApiEndpoints } from './sidebar.counts.api.endpoints';
import type { SidebarCountsApiResponse } from './sidebar.config';

export default class SidebarCountsApiService extends BaseApiService {
  private static instance: SidebarCountsApiService;

  private readonly sidebarCountsApiEndpoints = new SidebarCountsApiEndpoints();

  static getInstance(): SidebarCountsApiService {
    if (!SidebarCountsApiService.instance) {
      SidebarCountsApiService.instance = new SidebarCountsApiService();
    }

    return SidebarCountsApiService.instance;
  }

  protected get endpoints(): Partial<ApiEndpoints> {
    return {};
  }

  async fetchSidebarCounts(): Promise<ApiResponse<SidebarCountsApiResponse>> {
    return this.customPost<SidebarCountsApiResponse>(this.sidebarCountsApiEndpoints.organizationSidebarCounts);
  }
}
