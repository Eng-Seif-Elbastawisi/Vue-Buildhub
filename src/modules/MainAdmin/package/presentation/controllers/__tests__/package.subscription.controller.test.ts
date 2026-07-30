import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  DataFailed,
  DataSuccess,
} from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import { PackageSubscriptionStatus } from '../../../core/constants/package.subscription.status.enum';
import ChangePackageSubscriptionStatusParams from '../../../core/params/change.package.subscription.status.params';
import PackageSubscriptionRepository from '../../../data/repositories/package.subscription.repository';
import PackageSubscriptionController from '../package.subscription.controller';

const mocks = vi.hoisted(() => ({
  toastSuccess: vi.fn(),
  toastError: vi.fn(),
  toastWarning: vi.fn(),
  loading: vi.fn(),
  hideLoading: vi.fn(),
}));

vi.mock('@/base/Presentation/Dialogs/dialog.manager', () => ({
  dialogManager: {
    toastSuccess: mocks.toastSuccess,
    toastError: mocks.toastError,
    toastWarning: mocks.toastWarning,
    loading: mocks.loading,
    hideLoading: mocks.hideLoading,
  },
}));

describe('PackageSubscriptionController', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns the same singleton', () => {
    expect(PackageSubscriptionController.getInstance()).toBe(
      PackageSubscriptionController.getInstance(),
    );
  });

  it('updates status state and shows a success toast after changing subscription status', async () => {
    const repository = PackageSubscriptionRepository.getInstance();
    const controller = PackageSubscriptionController.getInstance();
    const params = new ChangePackageSubscriptionStatusParams({
      package_subscription_id: 1,
      status: PackageSubscriptionStatus.CONFIRMED,
      notes: 'approved',
    });

    vi.spyOn(repository, 'changePackageSubscriptionStatus').mockResolvedValue(
      new DataSuccess<void>({ message: 'Updated' }),
    );

    const result = await controller.changePackageSubscriptionStatus(params);

    expect(result).toBeInstanceOf(DataSuccess);
    expect(controller.statusUpdateState.value).toBeInstanceOf(DataSuccess);
    expect(mocks.toastSuccess).toHaveBeenCalledWith('Subscription status updated successfully.');
  });

  it('does not call the repository when params validation fails', async () => {
    const repository = PackageSubscriptionRepository.getInstance();
    const controller = PackageSubscriptionController.getInstance();
    const spy = vi.spyOn(repository, 'changePackageSubscriptionStatus');
    const params = new ChangePackageSubscriptionStatusParams({
      package_subscription_id: 0,
      status: PackageSubscriptionStatus.CONFIRMED,
    });

    const result = await controller.changePackageSubscriptionStatus(params);

    expect(result).toBeInstanceOf(DataFailed);
    expect(spy).not.toHaveBeenCalled();
    expect(mocks.toastWarning).toHaveBeenCalled();
  });
});
