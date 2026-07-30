import { DiscountType } from '@/modules/shared/Package/core/constants/discount.type.enum';
import { DurationType } from '@/modules/shared/Package/core/constants/duration.type.enum';
import { PackageSubscriptionStatus } from '@/modules/shared/Package/core/constants/package.subscription.status.enum';
import OrganizationPackageModel from '../../../core/models/organization.package.model';
import OrganizationPackageSubscriptionModel from '../../../core/models/organization.package.subscription.model';

export const createPackageOffer = (id = 8): OrganizationPackageModel =>
  OrganizationPackageModel.fromJson({
    id,
    title: 'Professional Package',
    price: '500.00',
    price_after_discount: '450.00',
    discount_type: DiscountType.PERCENTAGE,
    discount_value: '10.00',
    duration_type: DurationType.MONTH,
    duration: 6,
    features: [
      { id: 29, key: 1, key_name: 'NUMBER_OF_EMPLOYEES', value: 3 },
      { id: 30, key: 2, key_name: 'HAS_MOBILE', value: true },
      { id: 31, key: 3, key_name: 'HAS_PORTAL', value: false },
      { id: 32, key: 4, key_name: 'NUMBER_OF_PROJECTS', value: 33 },
    ],
    created_at: '2026-07-29 11:50:26',
  });

export const createSubscription = (
  status: PackageSubscriptionStatus = PackageSubscriptionStatus.PENDING,
  id = 1,
): OrganizationPackageSubscriptionModel =>
  OrganizationPackageSubscriptionModel.fromJson({
    id,
    package: { id: 8, title: 'Professional Package' },
    status,
    notes: null,
    created_at: '2026-07-29 06:44:24',
  });
