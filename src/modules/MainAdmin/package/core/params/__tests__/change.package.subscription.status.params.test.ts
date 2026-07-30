import { describe, expect, it } from 'vitest';
import { PackageSubscriptionStatus } from '../../constants/package.subscription.status.enum';
import ChangePackageSubscriptionStatusParams from '../change.package.subscription.status.params';

describe('ChangePackageSubscriptionStatusParams', () => {
  it('maps the change status payload expected by the API', () => {
    const params = new ChangePackageSubscriptionStatusParams({
      package_subscription_id: 1,
      status: PackageSubscriptionStatus.CONFIRMED,
      notes: 'zzzzz',
    });

    expect(params.toMap()).toEqual({
      package_subscription_id: 1,
      status: PackageSubscriptionStatus.CONFIRMED,
      notes: 'zzzzz',
    });
  });

  it('requires a positive subscription id and supported status', () => {
    const params = new ChangePackageSubscriptionStatusParams({
      package_subscription_id: 0,
      status: 99 as PackageSubscriptionStatus,
    });

    const validation = params.validate();

    expect(validation.isValid).toBe(false);
    expect(validation.errors.map((error) => error.field)).toEqual([
      'package_subscription_id',
      'status',
    ]);
  });
});
