import TitleInterface from '@/base/Data/Models/titleInterface';
import { translate } from '@/locales/i18n';

export const PackageSubscriptionStatus = {
  PENDING: 1,
  CONFIRMED: 2,
  REJECTED: 3,
} as const;

export type PackageSubscriptionStatus =
  (typeof PackageSubscriptionStatus)[keyof typeof PackageSubscriptionStatus];

const PACKAGE_SUBSCRIPTION_STATUSES: readonly PackageSubscriptionStatus[] = [
  PackageSubscriptionStatus.PENDING,
  PackageSubscriptionStatus.CONFIRMED,
  PackageSubscriptionStatus.REJECTED,
];

type TranslateFunction = (key: string) => string;

export const isPackageSubscriptionStatus = (
  status: unknown,
): status is PackageSubscriptionStatus => {
  const numericStatus = Number(status);

  return PACKAGE_SUBSCRIPTION_STATUSES.some(
    (packageSubscriptionStatus) => packageSubscriptionStatus === numericStatus,
  );
};

export const getPackageSubscriptionStatusLabelKey = (status: PackageSubscriptionStatus): string => {
  switch (status) {
    case PackageSubscriptionStatus.PENDING:
      return 'package.statuses.pending';
    case PackageSubscriptionStatus.CONFIRMED:
      return 'package.statuses.confirmed';
    case PackageSubscriptionStatus.REJECTED:
      return 'package.statuses.rejected';
    default:
      return 'unknown';
  }
};

export const getPackageSubscriptionStatusLabel = (status: PackageSubscriptionStatus): string =>
  translate(getPackageSubscriptionStatusLabelKey(status));

export const getPackageSubscriptionStatusClass = (status: PackageSubscriptionStatus): string => {
  switch (status) {
    case PackageSubscriptionStatus.PENDING:
      return 'package-subscription-status--pending';
    case PackageSubscriptionStatus.CONFIRMED:
      return 'package-subscription-status--confirmed';
    case PackageSubscriptionStatus.REJECTED:
      return 'package-subscription-status--rejected';
    default:
      return 'package-subscription-status--pending';
  }
};

export const getPackageSubscriptionStatusOptions = (
  translator: TranslateFunction = translate,
): TitleInterface<PackageSubscriptionStatus>[] =>
  PACKAGE_SUBSCRIPTION_STATUSES.map(
    (status) =>
      new TitleInterface<PackageSubscriptionStatus>({
        id: status,
        title: translator(getPackageSubscriptionStatusLabelKey(status)),
      }),
  );
