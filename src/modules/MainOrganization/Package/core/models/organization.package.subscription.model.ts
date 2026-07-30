import {
  isPackageSubscriptionStatus,
  PackageSubscriptionStatus,
  type PackageSubscriptionStatus as PackageSubscriptionStatusValue,
} from '@/modules/shared/Package/core/constants/package.subscription.status.enum';

export interface OrganizationPackageSubscriptionPackage {
  id: number;
  title: string;
}

export interface OrganizationPackageSubscription {
  id: number;
  package: OrganizationPackageSubscriptionPackage;
  status: PackageSubscriptionStatusValue;
  notes: string | null;
  created_at: string;
}

const isRecord = (rawValue: unknown): rawValue is Record<string, unknown> =>
  rawValue !== null && typeof rawValue === 'object' && !Array.isArray(rawValue);

const toFiniteNumber = (rawValue: unknown, fallback = 0): number => {
  const numericValue = Number(rawValue);

  return Number.isFinite(numericValue) ? numericValue : fallback;
};

const toStringValue = (rawValue: unknown): string =>
  rawValue !== null && rawValue !== undefined ? String(rawValue) : '';

const toStatus = (rawStatus: unknown): PackageSubscriptionStatusValue => {
  const numericStatus = toFiniteNumber(rawStatus, PackageSubscriptionStatus.PENDING);

  return isPackageSubscriptionStatus(numericStatus)
    ? numericStatus
    : PackageSubscriptionStatus.PENDING;
};

const toPackage = (rawPackage: unknown): OrganizationPackageSubscriptionPackage => {
  const packageRecord = isRecord(rawPackage) ? rawPackage : {};

  return {
    id: toFiniteNumber(packageRecord.id),
    title: toStringValue(packageRecord.title),
  };
};

const toNotes = (rawNotes: unknown): string | null => {
  const notes = toStringValue(rawNotes).trim();

  return notes || null;
};

export default class OrganizationPackageSubscriptionModel implements OrganizationPackageSubscription {
  public readonly id: number;
  public readonly package: OrganizationPackageSubscriptionPackage;
  public readonly status: PackageSubscriptionStatusValue;
  public readonly notes: string | null;
  public readonly created_at: string;

  constructor(subscription: OrganizationPackageSubscription) {
    this.id = subscription.id;
    this.package = subscription.package;
    this.status = subscription.status;
    this.notes = subscription.notes;
    this.created_at = subscription.created_at;

    Object.freeze(this.package);
    Object.freeze(this);
  }

  public get packageTitle(): string {
    return this.package.title;
  }

  public static fromJson(rawSubscription: unknown): OrganizationPackageSubscriptionModel {
    const subscription = isRecord(rawSubscription) ? rawSubscription : {};

    return new OrganizationPackageSubscriptionModel({
      id: toFiniteNumber(subscription.id),
      package: toPackage(subscription.package),
      status: toStatus(subscription.status),
      notes: toNotes(subscription.notes),
      created_at: toStringValue(subscription.created_at),
    });
  }

  public static readonly example = OrganizationPackageSubscriptionModel.fromJson({
    id: 1,
    package: {
      id: 8,
      title: 'Professional Package',
    },
    status: PackageSubscriptionStatus.PENDING,
    notes: null,
    created_at: '2026-07-29 06:44:24',
  });
}
