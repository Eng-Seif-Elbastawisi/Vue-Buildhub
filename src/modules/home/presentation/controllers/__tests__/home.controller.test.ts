import { afterEach, describe, expect, it, vi } from 'vitest';
import HomeController from '../home.controller';
import SidebarCountsApiService from '@/shared/LayoutComponents/SubComponents/sidebar.counts.api-service';

describe('HomeController', () => {
  afterEach(() => vi.restoreAllMocks());

  it.each(['organization', 'admin'] as const)(
    'reads %s Home counts from its sidebar count endpoint',
    async (role) => {
      const counts = { clients_count: 12, organizations_count: 8 };
      const request = vi
        .spyOn(SidebarCountsApiService.getInstance(), 'fetchSidebarCounts')
        .mockResolvedValue({
          statusCode: 200,
          data: { status: true, message: 'ok', data: counts },
        });

      expect(await HomeController.getInstance().fetchCounts(role)).toEqual(counts);
      expect(request).toHaveBeenCalledExactlyOnceWith(role);
    },
  );

  it('treats an unsuccessful count response as unavailable', async () => {
    vi.spyOn(SidebarCountsApiService.getInstance(), 'fetchSidebarCounts').mockResolvedValue({
      statusCode: 200,
      data: { status: false, message: 'unavailable', data: {} },
    });

    expect(await HomeController.getInstance().fetchCounts('admin')).toBeNull();
  });
});
