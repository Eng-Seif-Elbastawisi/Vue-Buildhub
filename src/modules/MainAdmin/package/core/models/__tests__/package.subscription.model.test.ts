import { describe, expect, it } from 'vitest';
import { DiscountType } from '../../constants/discount.type.enum';
import { DurationType } from '../../constants/duration.type.enum';
import {
  PackageSubscriptionStatus,
  type PackageSubscriptionStatus as PackageSubscriptionStatusValue,
} from '../../constants/package.subscription.status.enum';
import PackageSubscriptionModel from '../package.subscription.model';

describe('PackageSubscriptionModel', () => {
  it('safely maps package subscription response data', () => {
    const subscription = PackageSubscriptionModel.fromJson({
      id: '1',
      package: {
        id: '4',
        title: 'Professional Package Updated',
        price: '1500.00',
        price_after_discount: '1350.00',
        discount_type: DiscountType.PERCENTAGE,
        discount_value: '10.00',
        duration_type: DurationType.MONTH,
        duration: '6',
        created_at: '2026-07-26 07:35:43',
      },
      organization: { id: 14, name: 'Tech Company2' },
      organization_employee: { id: 16, name: 'Tech Company2_employee' },
      admin: { id: 1, name: 'Techlab Admin' },
      status: PackageSubscriptionStatus.CONFIRMED,
      notes: 'zzzzz',
      created_at: '2026-07-29 06:44:24',
    });

    expect(subscription.id).toBe(1);
    expect(subscription.packageTitle).toBe('Professional Package Updated');
    expect(subscription.organizationName).toBe('Tech Company2');
    expect(subscription.employeeName).toBe('Tech Company2_employee');
    expect(subscription.adminName).toBe('Techlab Admin');
    expect(subscription.status).toBe(PackageSubscriptionStatus.CONFIRMED);
    expect(subscription.durationDisplay).toBe('6 month');
    expect(subscription.originalPrice).toBe('1500.00');
    expect(subscription.priceAfterDiscount).toBe('1350.00');
  });

  it('uses safe fallbacks for missing nested data and unsupported statuses', () => {
    const subscription = PackageSubscriptionModel.fromJson({
      id: null,
      package: null,
      organization: null,
      organization_employee: null,
      admin: null,
      status: 99 as PackageSubscriptionStatusValue,
      notes: null,
      created_at: null,
    });

    expect(subscription.id).toBe(0);
    expect(subscription.packageTitle).toBe('-');
    expect(subscription.organizationName).toBe('-');
    expect(subscription.employeeName).toBe('-');
    expect(subscription.adminName).toBe('-');
    expect(subscription.status).toBe(PackageSubscriptionStatus.PENDING);
    expect(subscription.notes).toBe('');
    expect(subscription.durationDisplay).toBe('-');
  });
});
