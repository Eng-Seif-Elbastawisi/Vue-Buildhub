import { describe, expect, it, vi } from 'vitest';
import {
  DataFailed,
  DataSuccess,
} from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import { PackageSubscriptionStatus } from '../../../core/constants/package.subscription.status.enum';
import PackageSubscriptionModel from '../../../core/models/package.subscription.model';
import ChangePackageSubscriptionStatusParams from '../../../core/params/change.package.subscription.status.params';
import FetchPackageSubscriptionsParams from '../../../core/params/fetch.package.subscriptions.params';
import PackageApiService from '../../api/package.api-service';
import PackageSubscriptionRepository from '../package.subscription.repository';

describe('PackageSubscriptionRepository', () => {
  it('returns the same singleton', () => {
    expect(PackageSubscriptionRepository.getInstance()).toBe(
      PackageSubscriptionRepository.getInstance(),
    );
  });

  it('fetches and parses package subscriptions from response data', async () => {
    const repository = PackageSubscriptionRepository.getInstance();
    const apiService = PackageApiService.getInstance();

    vi.spyOn(apiService, 'fetchPackageSubscriptions').mockResolvedValue({
      data: {
        status: true,
        message: 'Package subscriptions fetched successfully.',
        data: [PackageSubscriptionModel.example],
      },
      statusCode: 200,
    });

    const result = await repository.index(new FetchPackageSubscriptionsParams());

    expect(result).toBeInstanceOf(DataSuccess);
    expect(result.data).toEqual([expect.any(PackageSubscriptionModel)]);
    expect(result.data?.[0].packageTitle).toBe('Professional Package Updated');
  });

  it('returns DataState results for subscription status updates', async () => {
    const repository = PackageSubscriptionRepository.getInstance();
    const apiService = PackageApiService.getInstance();
    const params = new ChangePackageSubscriptionStatusParams({
      package_subscription_id: 1,
      status: PackageSubscriptionStatus.CONFIRMED,
      notes: 'zzzzz',
    });

    vi.spyOn(apiService, 'changePackageSubscriptionStatus').mockResolvedValueOnce({
      data: { status: true, message: 'Status changed' },
      statusCode: 200,
    });

    const success = await repository.changePackageSubscriptionStatus(params);

    vi.spyOn(apiService, 'changePackageSubscriptionStatus').mockResolvedValueOnce({
      data: { status: false, message: 'Cannot change status' },
      statusCode: 400,
    });

    const failed = await repository.changePackageSubscriptionStatus(params);

    expect(success).toBeInstanceOf(DataSuccess);
    expect(success.message).toBe('Status changed');
    expect(failed).toBeInstanceOf(DataFailed);
    expect(failed.error?.displayMessage).toBe('Cannot change status');
  });
});
