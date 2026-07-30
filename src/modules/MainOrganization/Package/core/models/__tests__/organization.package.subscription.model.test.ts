import { describe, expect, it } from 'vitest';
import { PackageSubscriptionStatus } from '@/modules/shared/Package/core/constants/package.subscription.status.enum';
import OrganizationPackageSubscriptionModel from '../organization.package.subscription.model';

describe('OrganizationPackageSubscriptionModel', () => {
  it('maps package subscription history records', () => {
    const subscription = OrganizationPackageSubscriptionModel.fromJson({
      id: '14',
      package: { id: '8', title: 'Professional' },
      status: PackageSubscriptionStatus.CONFIRMED,
      notes: 'Approved',
      created_at: '2026-07-29 06:44:24',
    });

    expect(subscription).toEqual(
      expect.objectContaining({
        id: 14,
        package: { id: 8, title: 'Professional' },
        status: PackageSubscriptionStatus.CONFIRMED,
        notes: 'Approved',
      }),
    );
    expect(subscription.packageTitle).toBe('Professional');
  });

  it('falls back safely when nested package, notes, dates, or status are missing', () => {
    const subscription = OrganizationPackageSubscriptionModel.fromJson({ status: 99 });

    expect(subscription.package).toEqual({ id: 0, title: '' });
    expect(subscription.notes).toBeNull();
    expect(subscription.created_at).toBe('');
    expect(subscription.status).toBe(PackageSubscriptionStatus.PENDING);
  });
});
