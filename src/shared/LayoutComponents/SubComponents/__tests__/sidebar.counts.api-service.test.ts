import { describe, expect, it, vi } from 'vitest';

import SidebarCountsApiService from '../sidebar.counts.api-service';
import type { ApiResponse } from '@/base/Data/ApiService/baseApiService';

describe('SidebarCountsApiService', () => {
  it('fetches sidebar counts via GET', async () => {
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

    const result = await service.fetchSidebarCounts();

    expect(customPostSpy).toHaveBeenCalledWith(
      expect.stringContaining('organization_sidebar_counts'),
    );

    expect(result).toEqual(response);

    customPostSpy.mockRestore();
  });
});
