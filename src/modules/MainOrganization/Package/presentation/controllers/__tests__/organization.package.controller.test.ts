import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  DataInitial,
  DataSuccess,
} from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import FetchOrganizationPackageSubscriptionsParams from '../../../core/params/fetch.organization.package.subscriptions.params';
import FetchOrganizationPackagesParams from '../../../core/params/fetch.organization.packages.params';
import SubscribeToPackageParams from '../../../core/params/subscribe.to.package.params';
import OrganizationPackageApiService from '../../../data/api/organization.package.api-service';
import OrganizationPackageController from '../organization.package.controller';

describe('OrganizationPackageController', () => {
  const apiService = OrganizationPackageApiService.getInstance();
  const controller = OrganizationPackageController.getInstance();

  beforeEach(() => {
    controller.packagesState.value = new DataInitial();
    controller.subscriptionsState.value = new DataInitial();
    controller.subscribeState.value = new DataInitial();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('keeps package and subscription loading results in separate states', async () => {
    vi.spyOn(apiService, 'fetchPackages').mockResolvedValue({
      statusCode: 200,
      data: { status: true, data: [{ id: 8, title: 'Professional' }] },
    });
    vi.spyOn(apiService, 'fetchPackageSubscriptions').mockResolvedValue({
      statusCode: 200,
      data: {
        status: true,
        data: [{ id: 1, package: { id: 8, title: 'Professional' }, status: 1 }],
      },
    });

    await Promise.all([
      controller.fetchPackages(new FetchOrganizationPackagesParams()),
      controller.fetchPackageSubscriptions(new FetchOrganizationPackageSubscriptionsParams()),
    ]);

    expect(controller.packagesState.value).toBeInstanceOf(DataSuccess);
    expect(controller.packagesState.value.data?.[0]?.id).toBe(8);
    expect(controller.subscriptionsState.value).toBeInstanceOf(DataSuccess);
    expect(controller.subscriptionsState.value.data?.[0]?.package.id).toBe(8);
  });

  it('stores the backend subscription success independently from list states', async () => {
    vi.spyOn(apiService, 'subscribeToPackage').mockResolvedValue({
      statusCode: 200,
      data: { status: true, message: 'Subscription queued' },
    });

    const subscriptionState = await controller.subscribeToPackage(
      new SubscribeToPackageParams({ package_id: 8 }),
    );

    expect(subscriptionState).toBeInstanceOf(DataSuccess);
    expect(controller.subscribeState.value).toBeInstanceOf(DataSuccess);
    expect(controller.subscribeState.value.message).toBe('Subscription queued');
    expect(subscriptionState.message).toBe('Subscription queued');
    expect(controller.packagesState.value).toBeInstanceOf(DataInitial);
  });
});
