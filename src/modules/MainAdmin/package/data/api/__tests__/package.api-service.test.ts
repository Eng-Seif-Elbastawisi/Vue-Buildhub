import { describe, expect, it, vi } from 'vitest';
import { PackageSubscriptionStatus } from '../../../core/constants/package.subscription.status.enum';
import ChangePackageSubscriptionStatusParams from '../../../core/params/change.package.subscription.status.params';
import FetchPackageSubscriptionsParams from '../../../core/params/fetch.package.subscriptions.params';
import PackageApiService from '../package.api-service';

describe('PackageApiService', () => {
  it('returns the same singleton', () => {
    expect(PackageApiService.getInstance()).toBe(PackageApiService.getInstance());
  });

  it('maps package subscription custom methods to their endpoints', async () => {
    const service = PackageApiService.getInstance();
    const spy = vi.spyOn(service, 'customPost').mockResolvedValue({} as never);
    const fetchParams = new FetchPackageSubscriptionsParams();
    const statusParams = new ChangePackageSubscriptionStatusParams({
      package_subscription_id: 1,
      status: PackageSubscriptionStatus.CONFIRMED,
      notes: 'zzzzz',
    });

    await service.fetchPackageSubscriptions(fetchParams);
    await service.changePackageSubscriptionStatus(statusParams);

    expect(spy).toHaveBeenCalledWith(
      expect.stringContaining('mainportal/fetch_package_subscriptions'),
      fetchParams,
      undefined,
    );
    expect(spy).toHaveBeenCalledWith(
      expect.stringContaining('mainportal/change_package_subscription_status'),
      statusParams,
      undefined,
    );

    spy.mockRestore();
  });
});
