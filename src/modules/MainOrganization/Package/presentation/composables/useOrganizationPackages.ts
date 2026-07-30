import { computed, ref } from 'vue';
import {
  DataLoading,
  DataSuccess,
} from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import { DiscountType } from '@/modules/shared/Package/core/constants/discount.type.enum';
import { DurationType } from '@/modules/shared/Package/core/constants/duration.type.enum';
import {
  PackageFeatureName,
  type PackageFeatureName as PackageFeatureNameValue,
} from '@/modules/shared/Package/core/constants/features.enum';
import { PackageSubscriptionStatus } from '@/modules/shared/Package/core/constants/package.subscription.status.enum';
import type OrganizationPackageModel from '../../core/models/organization.package.model';
import type OrganizationPackageSubscriptionModel from '../../core/models/organization.package.subscription.model';
import FetchOrganizationPackageSubscriptionsParams from '../../core/params/fetch.organization.package.subscriptions.params';
import FetchOrganizationPackagesParams from '../../core/params/fetch.organization.packages.params';
import SubscribeToPackageParams from '../../core/params/subscribe.to.package.params';
import OrganizationPackageController from '../controllers/organization.package.controller';

export const getFeatureValue = (
  packageOffer: OrganizationPackageModel,
  featureName: PackageFeatureNameValue,
): number | boolean | string | undefined =>
  packageOffer.features.find((feature) => feature.key_name === featureName)?.value;

const getNumericFeature = (
  packageOffer: OrganizationPackageModel,
  featureName: PackageFeatureNameValue,
): number => {
  const numericValue = Number(getFeatureValue(packageOffer, featureName));

  return Number.isFinite(numericValue) ? numericValue : 0;
};

const getBooleanFeature = (
  packageOffer: OrganizationPackageModel,
  featureName: PackageFeatureNameValue,
): boolean => {
  const featureValue = getFeatureValue(packageOffer, featureName);

  return (
    featureValue === true || featureValue === 1 || featureValue === '1' || featureValue === 'true'
  );
};

export const getEmployeesCount = (packageOffer: OrganizationPackageModel): number =>
  getNumericFeature(packageOffer, PackageFeatureName.NUMBER_OF_EMPLOYEES);

export const getProjectsCount = (packageOffer: OrganizationPackageModel): number =>
  getNumericFeature(packageOffer, PackageFeatureName.NUMBER_OF_PROJECTS);

export const hasMobile = (packageOffer: OrganizationPackageModel): boolean =>
  getBooleanFeature(packageOffer, PackageFeatureName.HAS_MOBILE);

export const hasPortal = (packageOffer: OrganizationPackageModel): boolean =>
  getBooleanFeature(packageOffer, PackageFeatureName.HAS_PORTAL);

export const hasDifferentPackagePrice = (packageOffer: OrganizationPackageModel): boolean => {
  const originalPrice = Number(packageOffer.price);
  const finalPrice = Number(packageOffer.price_after_discount);

  if (Number.isFinite(originalPrice) && Number.isFinite(finalPrice)) {
    return originalPrice !== finalPrice;
  }

  return packageOffer.price.trim() !== packageOffer.price_after_discount.trim();
};

export const hasPackageDiscount = (packageOffer: OrganizationPackageModel): boolean => {
  const discountValue = Number(packageOffer.discount_value);
  const validDiscountType =
    packageOffer.discount_type === DiscountType.PERCENTAGE ||
    packageOffer.discount_type === DiscountType.VALUE;

  return (
    validDiscountType &&
    Number.isFinite(discountValue) &&
    discountValue > 0 &&
    hasDifferentPackagePrice(packageOffer)
  );
};

export const getDurationLabelKey = (durationType: number, duration: number): string => {
  const singular = duration === 1;

  switch (durationType) {
    case DurationType.DAY:
      return singular ? 'organization_packages.day' : 'organization_packages.days';
    case DurationType.WEEK:
      return singular ? 'organization_packages.week' : 'organization_packages.weeks';
    case DurationType.MONTH:
      return singular ? 'organization_packages.month' : 'organization_packages.months';
    case DurationType.YEAR:
      return singular ? 'organization_packages.year' : 'organization_packages.years';
    default:
      return 'unknown';
  }
};

export const getLatestSubscriptionForPackage = (
  subscriptions: OrganizationPackageSubscriptionModel[],
  packageId: number,
): OrganizationPackageSubscriptionModel | null =>
  subscriptions.reduce<OrganizationPackageSubscriptionModel | null>((latest, subscription) => {
    if (subscription.package.id !== packageId) {
      return latest;
    }

    return latest === null || subscription.id > latest.id ? subscription : latest;
  }, null);

export const blocksNewSubscription = (
  subscription: OrganizationPackageSubscriptionModel | null,
): boolean =>
  subscription?.status === PackageSubscriptionStatus.PENDING ||
  subscription?.status === PackageSubscriptionStatus.CONFIRMED;

export const getSubscriptionActionLabelKey = (
  subscription: OrganizationPackageSubscriptionModel | null,
): string => {
  switch (subscription?.status) {
    case PackageSubscriptionStatus.PENDING:
      return 'organization_packages.subscription_pending';
    case PackageSubscriptionStatus.CONFIRMED:
      return 'organization_packages.current_package';
    case PackageSubscriptionStatus.REJECTED:
      return 'organization_packages.subscribe_again';
    default:
      return 'organization_packages.subscribe_now';
  }
};

export const useOrganizationPackages = () => {
  const controller = OrganizationPackageController.getInstance();
  const selectedPackage = ref<OrganizationPackageModel | null>(null);
  const subscriptionDialogVisible = ref(false);

  const packagesState = computed(() => controller.packagesState.value);
  const subscriptionsState = computed(() => controller.subscriptionsState.value);
  const subscribeState = computed(() => controller.subscribeState.value);
  const subscribing = computed(() => subscribeState.value instanceof DataLoading);

  const packages = computed<OrganizationPackageModel[]>(() => {
    const packageState = packagesState.value;

    return packageState instanceof DataSuccess && Array.isArray(packageState.data)
      ? packageState.data
      : [];
  });

  const subscriptions = computed<OrganizationPackageSubscriptionModel[]>(() => {
    const subscriptionState = subscriptionsState.value;

    return subscriptionState instanceof DataSuccess && Array.isArray(subscriptionState.data)
      ? subscriptionState.data
      : [];
  });

  const fetchPackages = async (): Promise<void> => {
    await controller.fetchPackages(new FetchOrganizationPackagesParams());
  };

  const fetchPackageSubscriptions = async (): Promise<void> => {
    await controller.fetchPackageSubscriptions(new FetchOrganizationPackageSubscriptionsParams());
  };

  const initialize = async (): Promise<void> => {
    await Promise.all([fetchPackages(), fetchPackageSubscriptions()]);
  };

  const latestSubscription = (packageId: number): OrganizationPackageSubscriptionModel | null =>
    getLatestSubscriptionForPackage(subscriptions.value, packageId);

  const openSubscriptionDialog = (packageOffer: OrganizationPackageModel): void => {
    if (blocksNewSubscription(latestSubscription(packageOffer.id))) {
      return;
    }

    controller.resetSubscribeState();
    selectedPackage.value = packageOffer;
    subscriptionDialogVisible.value = true;
  };

  const closeSubscriptionDialog = (): void => {
    if (subscribing.value) {
      return;
    }

    subscriptionDialogVisible.value = false;
    selectedPackage.value = null;
    controller.resetSubscribeState();
  };

  const confirmSubscription = async (): Promise<void> => {
    const packageOffer = selectedPackage.value;

    if (
      !packageOffer ||
      subscribing.value ||
      blocksNewSubscription(latestSubscription(packageOffer.id))
    ) {
      return;
    }

    const subscriptionState = await controller.subscribeToPackage(
      new SubscribeToPackageParams({ package_id: packageOffer.id }),
    );

    if (!(subscriptionState instanceof DataSuccess)) {
      return;
    }

    closeSubscriptionDialog();
    await fetchPackageSubscriptions();
  };

  return {
    packagesState,
    subscriptionsState,
    subscribeState,
    packages,
    subscriptions,
    selectedPackage,
    subscriptionDialogVisible,
    subscribing,
    fetchPackages,
    fetchPackageSubscriptions,
    initialize,
    openSubscriptionDialog,
    closeSubscriptionDialog,
    confirmSubscription,
  };
};
