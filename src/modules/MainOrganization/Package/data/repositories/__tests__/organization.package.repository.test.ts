import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  DataFailed,
  DataSuccess,
} from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import FetchOrganizationPackageSubscriptionsParams from '../../../core/params/fetch.organization.package.subscriptions.params';
import FetchOrganizationPackagesParams from '../../../core/params/fetch.organization.packages.params';
import SubscribeToPackageParams from '../../../core/params/subscribe.to.package.params';
import OrganizationPackageApiService from '../../api/organization.package.api-service';
import OrganizationPackageRepository from '../organization.package.repository';

describe('OrganizationPackageRepository', () => {
  const apiService = OrganizationPackageApiService.getInstance();
  const repository = OrganizationPackageRepository.getInstance();

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('maps package and history API collections into domain models', async () => {
    vi.spyOn(apiService, 'fetchPackages').mockResolvedValue({
      statusCode: 200,
      data: {
        status: true,
        data: [{ id: 8, title: 'Professional', price: '500.00' }],
      },
    });
    vi.spyOn(apiService, 'fetchPackageSubscriptions').mockResolvedValue({
      statusCode: 200,
      data: {
        status: true,
        data: [{ id: 3, package: { id: 8, title: 'Professional' }, status: 1 }],
      },
    });

    const packageState = await repository.fetchPackages(new FetchOrganizationPackagesParams());
    const historyState = await repository.fetchPackageSubscriptions(
      new FetchOrganizationPackageSubscriptionsParams(),
    );

    expect(packageState).toBeInstanceOf(DataSuccess);
    expect(packageState.data?.[0]).toEqual(
      expect.objectContaining({ id: 8, title: 'Professional', price: '500.00' }),
    );
    expect(historyState).toBeInstanceOf(DataSuccess);
    expect(historyState.data?.[0]).toEqual(
      expect.objectContaining({ id: 3, package: { id: 8, title: 'Professional' }, status: 1 }),
    );
  });

  it('accepts a successful subscription response without a data field', async () => {
    vi.spyOn(apiService, 'subscribeToPackage').mockResolvedValue({
      statusCode: 201,
      data: { status: true, message: 'Created by backend' },
    });

    const subscriptionState = await repository.subscribeToPackage(
      new SubscribeToPackageParams({ package_id: 8 }),
    );

    expect(subscriptionState).toBeInstanceOf(DataSuccess);
    expect(subscriptionState.message).toBe('Created by backend');
  });

  it('preserves the backend failure message for subscription errors', async () => {
    vi.spyOn(apiService, 'subscribeToPackage').mockResolvedValue({
      statusCode: 422,
      data: { status: false, message: 'Package cannot be subscribed' },
    });

    const subscriptionState = await repository.subscribeToPackage(
      new SubscribeToPackageParams({ package_id: 8 }),
    );

    expect(subscriptionState).toBeInstanceOf(DataFailed);
    expect(subscriptionState.error?.displayMessage).toBe('Package cannot be subscribed');
  });
});
