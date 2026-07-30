import { describe, expect, it } from 'vitest';
import { DiscountType } from '@/modules/shared/Package/core/constants/discount.type.enum';
import { DurationType } from '@/modules/shared/Package/core/constants/duration.type.enum';
import { PackageSubscriptionStatus } from '@/modules/shared/Package/core/constants/package.subscription.status.enum';
import OrganizationPackageModel from '../../../core/models/organization.package.model';
import OrganizationPackageSubscriptionModel from '../../../core/models/organization.package.subscription.model';
import {
  blocksNewSubscription,
  getDurationLabelKey,
  getEmployeesCount,
  hasDifferentPackagePrice,
  getLatestSubscriptionForPackage,
  getProjectsCount,
  getSubscriptionActionLabelKey,
  hasMobile,
  hasPackageDiscount,
  hasPortal,
} from '../useOrganizationPackages';

const packageOffer = OrganizationPackageModel.fromJson({
  id: 8,
  title: 'Professional',
  price: '500.00',
  price_after_discount: '450.00',
  discount_type: DiscountType.PERCENTAGE,
  discount_value: '10.00',
  duration_type: DurationType.MONTH,
  duration: 6,
  features: [
    { key_name: 'HAS_PORTAL', value: false },
    { key_name: 'NUMBER_OF_PROJECTS', value: '33' },
    { key_name: 'HAS_MOBILE', value: 'true' },
    { key_name: 'NUMBER_OF_EMPLOYEES', value: 3 },
  ],
});

const subscription = (
  id: number,
  status: PackageSubscriptionStatus,
): OrganizationPackageSubscriptionModel =>
  OrganizationPackageSubscriptionModel.fromJson({
    id,
    package: { id: 8, title: 'Professional' },
    status,
  });

describe('organization package presentation rules', () => {
  it('maps features by key_name regardless of API order', () => {
    expect(getEmployeesCount(packageOffer)).toBe(3);
    expect(getProjectsCount(packageOffer)).toBe(33);
    expect(hasMobile(packageOffer)).toBe(true);
    expect(hasPortal(packageOffer)).toBe(false);
  });

  it('uses backend discount and duration values for display decisions', () => {
    expect(hasPackageDiscount(packageOffer)).toBe(true);
    expect(getDurationLabelKey(packageOffer.duration_type, packageOffer.duration)).toBe(
      'organization_packages.months',
    );
  });

  it('does not show a discount when differently formatted prices are numerically equal', () => {
    const equalPriceOffer = OrganizationPackageModel.fromJson({
      price: '500.0',
      price_after_discount: '500.00',
      discount_type: DiscountType.PERCENTAGE,
      discount_value: '10.00',
    });

    expect(hasPackageDiscount(equalPriceOffer)).toBe(false);
    expect(hasDifferentPackagePrice(equalPriceOffer)).toBe(false);
  });

  it('keeps the original price visible when backend prices differ without a valid badge', () => {
    const differentPriceOffer = OrganizationPackageModel.fromJson({
      price: '500.00',
      price_after_discount: '450.00',
      discount_type: 99,
      discount_value: '10.00',
    });

    expect(hasDifferentPackagePrice(differentPriceOffer)).toBe(true);
    expect(hasPackageDiscount(differentPriceOffer)).toBe(false);
  });

  it('uses the highest subscription ID as the latest package status', () => {
    const latest = getLatestSubscriptionForPackage(
      [
        subscription(2, PackageSubscriptionStatus.CONFIRMED),
        subscription(5, PackageSubscriptionStatus.REJECTED),
        OrganizationPackageSubscriptionModel.fromJson({
          id: 9,
          package: { id: 20, title: 'Other package' },
          status: PackageSubscriptionStatus.PENDING,
        }),
      ],
      8,
    );

    expect(latest?.id).toBe(5);
    expect(blocksNewSubscription(latest)).toBe(false);
    expect(getSubscriptionActionLabelKey(latest)).toBe('organization_packages.subscribe_again');
  });

  it.each([
    [PackageSubscriptionStatus.PENDING, 'organization_packages.subscription_pending'],
    [PackageSubscriptionStatus.CONFIRMED, 'organization_packages.current_package'],
  ])('blocks duplicate subscription status %s', (status, expectedLabelKey) => {
    const latest = subscription(6, status);

    expect(blocksNewSubscription(latest)).toBe(true);
    expect(getSubscriptionActionLabelKey(latest)).toBe(expectedLabelKey);
  });
});
