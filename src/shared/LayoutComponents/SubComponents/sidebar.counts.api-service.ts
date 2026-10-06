import BaseApiService, {
  type ApiEndpoints,
  type ApiResponse,
} from '@/base/Data/ApiService/baseApiService';

import {
  AdminSidebarCountsApiEndpoints,
  SidebarCountsApiEndpoints,
} from './sidebar.counts.api.endpoints';
import type { SidebarCountsApiResponse, SidebarRole } from './sidebar.config';

export default class SidebarCountsApiService extends BaseApiService {
  private static instance: SidebarCountsApiService;

  private readonly sidebarCountsApiEndpoints = new SidebarCountsApiEndpoints();
  private readonly adminSidebarCountsApiEndpoints = new AdminSidebarCountsApiEndpoints();

  static getInstance(): SidebarCountsApiService {
    if (!SidebarCountsApiService.instance) {
      SidebarCountsApiService.instance = new SidebarCountsApiService();
    }

    return SidebarCountsApiService.instance;
  }

  protected get endpoints(): Partial<ApiEndpoints> {
    return {};
  }

  async fetchSidebarCounts(role: SidebarRole): Promise<ApiResponse<SidebarCountsApiResponse>> {
    const endpoint =
      role === 'admin'
        ? this.adminSidebarCountsApiEndpoints.adminSidebarCounts
        : this.sidebarCountsApiEndpoints.organizationSidebarCounts;

    return this.customPost<SidebarCountsApiResponse>(endpoint);
  }
}
