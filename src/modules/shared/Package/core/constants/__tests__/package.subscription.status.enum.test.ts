import { describe, expect, it } from 'vitest';
import {
  PackageSubscriptionStatus,
  getPackageSubscriptionStatusClass,
  getPackageSubscriptionStatusLabelKey,
  isPackageSubscriptionStatus,
} from '../package.subscription.status.enum';

describe('shared package subscription statuses', () => {
  it.each([
    [
      PackageSubscriptionStatus.PENDING,
      'package.statuses.pending',
      'package-subscription-status--pending',
    ],
    [
      PackageSubscriptionStatus.CONFIRMED,
      'package.statuses.confirmed',
      'package-subscription-status--confirmed',
    ],
    [
      PackageSubscriptionStatus.REJECTED,
      'package.statuses.rejected',
      'package-subscription-status--rejected',
    ],
  ])(
    'maps subscription status %s to its UI contract',
    (status, expectedLabelKey, expectedClass) => {
      expect(isPackageSubscriptionStatus(status)).toBe(true);
      expect(getPackageSubscriptionStatusLabelKey(status)).toBe(expectedLabelKey);
      expect(getPackageSubscriptionStatusClass(status)).toBe(expectedClass);
    },
  );

  it('rejects unsupported subscription statuses', () => {
    expect(isPackageSubscriptionStatus(4)).toBe(false);
  });
});
