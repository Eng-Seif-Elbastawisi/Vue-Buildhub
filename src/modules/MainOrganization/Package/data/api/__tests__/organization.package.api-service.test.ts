import { afterEach, describe, expect, it, vi } from 'vitest';
import FetchOrganizationPackageSubscriptionsParams from '../../../core/params/fetch.organization.package.subscriptions.params';
import FetchOrganizationPackagesParams from '../../../core/params/fetch.organization.packages.params';
import SubscribeToPackageParams from '../../../core/params/subscribe.to.package.params';
import OrganizationPackageApiService from '../organization.package.api-service';

describe('OrganizationPackageApiService', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('sends Params instances to the three configured custom endpoints', async () => {
    const apiService = OrganizationPackageApiService.getInstance();
    const customPost = vi.spyOn(apiService, 'customPost').mockResolvedValue({
      statusCode: 200,
      data: { status: true, data: [] },
    });
    const packageParams = new FetchOrganizationPackagesParams();
    const subscriptionParams = new SubscribeToPackageParams({ package_id: 4 });
    const historyParams = new FetchOrganizationPackageSubscriptionsParams();

    await apiService.fetchPackages(packageParams);
    await apiService.subscribeToPackage(subscriptionParams);
    await apiService.fetchPackageSubscriptions(historyParams);

    expect(customPost).toHaveBeenNthCalledWith(
      1,
      expect.stringContaining('mainportal/fetch_packages'),
      packageParams,
      undefined,
    );
    expect(customPost).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining('mainportal/subscribe_to_package'),
      subscriptionParams,
      undefined,
    );
    expect(customPost).toHaveBeenNthCalledWith(
      3,
      expect.stringContaining('mainportal/fetch_package_subscriptions'),
      historyParams,
      undefined,
    );
  });
});
