import { describe, expect, it } from 'vitest';
import {
  getPackageSubscriptionStatusClass,
  getPackageSubscriptionStatusLabelKey,
  getPackageSubscriptionStatusOptions,
  isPackageSubscriptionStatus,
  PackageSubscriptionStatus,
} from '../package.subscription.status.enum';

describe('PackageSubscriptionStatus', () => {
  it('maps status values to translated label keys and classes', () => {
    expect(getPackageSubscriptionStatusLabelKey(PackageSubscriptionStatus.PENDING)).toBe(
      'package.statuses.pending',
    );
    expect(getPackageSubscriptionStatusLabelKey(PackageSubscriptionStatus.CONFIRMED)).toBe(
      'package.statuses.confirmed',
    );
    expect(getPackageSubscriptionStatusLabelKey(PackageSubscriptionStatus.REJECTED)).toBe(
      'package.statuses.rejected',
    );

    expect(getPackageSubscriptionStatusClass(PackageSubscriptionStatus.PENDING)).toBe(
      'package-subscription-status--pending',
    );
    expect(getPackageSubscriptionStatusClass(PackageSubscriptionStatus.CONFIRMED)).toBe(
      'package-subscription-status--confirmed',
    );
    expect(getPackageSubscriptionStatusClass(PackageSubscriptionStatus.REJECTED)).toBe(
      'package-subscription-status--rejected',
    );
  });

  it('validates supported subscription statuses', () => {
    expect(isPackageSubscriptionStatus(PackageSubscriptionStatus.PENDING)).toBe(true);
    expect(isPackageSubscriptionStatus(4)).toBe(false);
  });

  it('creates translated select options', () => {
    expect(getPackageSubscriptionStatusOptions((key) => key)).toEqual([
      expect.objectContaining({
        id: PackageSubscriptionStatus.PENDING,
        title: 'package.statuses.pending',
      }),
      expect.objectContaining({
        id: PackageSubscriptionStatus.CONFIRMED,
        title: 'package.statuses.confirmed',
      }),
      expect.objectContaining({
        id: PackageSubscriptionStatus.REJECTED,
        title: 'package.statuses.rejected',
      }),
    ]);
  });
});
