import { describe, expect, it, vi } from 'vitest';

import SidebarCountsApiService from '../sidebar.counts.api-service';
import type { ApiResponse } from '@/base/Data/ApiService/baseApiService';

describe('SidebarCountsApiService', () => {
  it('fetches organization sidebar counts via POST', async () => {
    const service = SidebarCountsApiService.getInstance();
    const response: ApiResponse = {
      data: {
        status: true,
        message: 'Counts fetched successfully.',
        data: {},
      },
      statusCode: 200,
    };

    const customPostSpy = vi.spyOn(service, 'customPost').mockResolvedValue(response);

    const result = await service.fetchSidebarCounts('organization');

    expect(customPostSpy).toHaveBeenCalledWith(
      expect.stringContaining('organization_sidebar_counts'),
    );

    expect(result).toEqual(response);

    customPostSpy.mockRestore();
  });

  it('fetches admin sidebar counts via the admin endpoint', async () => {
    const service = SidebarCountsApiService.getInstance();
    const response: ApiResponse = {
      data: {
        status: true,
        message: 'Counts fetched successfully.',
        data: { packages_count: 2 },
      },
      statusCode: 200,
    };
    const customPostSpy = vi.spyOn(service, 'customPost').mockResolvedValue(response);

    expect(await service.fetchSidebarCounts('admin')).toEqual(response);
    expect(customPostSpy).toHaveBeenCalledWith(
      expect.stringContaining('/mainportal/admin_sidebar_counts'),
    );

    customPostSpy.mockRestore();
  });
});
