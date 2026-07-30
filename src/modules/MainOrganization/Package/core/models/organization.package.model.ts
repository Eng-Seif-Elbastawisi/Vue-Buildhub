import type { DiscountType } from '@/modules/shared/Package/core/constants/discount.type.enum';
import type { DurationType } from '@/modules/shared/Package/core/constants/duration.type.enum';

export type OrganizationPackageFeatureValue = number | boolean | string;

export interface OrganizationPackageFeature {
  id: number;
  key: number;
  key_name: string;
  value: OrganizationPackageFeatureValue;
}

export interface OrganizationPackage {
  id: number;
  title: string;
  price: string;
  price_after_discount: string;
  discount_type: number;
  discount_value: string;
  duration_type: number;
  duration: number;
  features: OrganizationPackageFeature[];
  created_at: string;
}

interface OrganizationPackageModelData extends Omit<OrganizationPackage, 'features'> {
  discount_type: DiscountType | number;
  duration_type: DurationType | number;
  features: OrganizationPackageFeatureModel[];
}

const isRecord = (rawValue: unknown): rawValue is Record<string, unknown> =>
  rawValue !== null && typeof rawValue === 'object' && !Array.isArray(rawValue);

const toFiniteNumber = (rawValue: unknown, fallback = 0): number => {
  const numericValue = Number(rawValue);

  return Number.isFinite(numericValue) ? numericValue : fallback;
};

const toStringValue = (rawValue: unknown, fallback = ''): string =>
  rawValue !== null && rawValue !== undefined ? String(rawValue) : fallback;

const toFeatureValue = (rawValue: unknown): OrganizationPackageFeatureValue => {
  if (typeof rawValue === 'number' || typeof rawValue === 'boolean') {
    return rawValue;
  }

  return typeof rawValue === 'string' ? rawValue : '';
};

export class OrganizationPackageFeatureModel implements OrganizationPackageFeature {
  public readonly id: number;
  public readonly key: number;
  public readonly key_name: string;
  public readonly value: OrganizationPackageFeatureValue;

  constructor(feature: OrganizationPackageFeature) {
    this.id = feature.id;
    this.key = feature.key;
    this.key_name = feature.key_name;
    this.value = feature.value;

    Object.freeze(this);
  }

  public static fromJson(rawFeature: unknown): OrganizationPackageFeatureModel {
    const feature = isRecord(rawFeature) ? rawFeature : {};

    return new OrganizationPackageFeatureModel({
      id: toFiniteNumber(feature.id),
      key: toFiniteNumber(feature.key),
      key_name: toStringValue(feature.key_name),
      value: toFeatureValue(feature.value),
    });
  }
}

export default class OrganizationPackageModel implements OrganizationPackage {
  public readonly id: number;
  public readonly title: string;
  public readonly price: string;
  public readonly price_after_discount: string;
  public readonly discount_type: DiscountType | number;
  public readonly discount_value: string;
  public readonly duration_type: DurationType | number;
  public readonly duration: number;
  public readonly features: OrganizationPackageFeatureModel[];
  public readonly created_at: string;

  constructor(packageDetails: OrganizationPackageModelData) {
    this.id = packageDetails.id;
    this.title = packageDetails.title;
    this.price = packageDetails.price;
    this.price_after_discount = packageDetails.price_after_discount;
    this.discount_type = packageDetails.discount_type;
    this.discount_value = packageDetails.discount_value;
    this.duration_type = packageDetails.duration_type;
    this.duration = packageDetails.duration;
    this.features = packageDetails.features;
    this.created_at = packageDetails.created_at;

    Object.freeze(this.features);
    Object.freeze(this);
  }

  public static fromJson(rawPackage: unknown): OrganizationPackageModel {
    const packageRecord = isRecord(rawPackage) ? rawPackage : {};
    const price = toStringValue(packageRecord.price, '0');

    return new OrganizationPackageModel({
      id: toFiniteNumber(packageRecord.id),
      title: toStringValue(packageRecord.title),
      price,
      price_after_discount: toStringValue(packageRecord.price_after_discount, price),
      discount_type: toFiniteNumber(packageRecord.discount_type),
      discount_value: toStringValue(packageRecord.discount_value, '0'),
      duration_type: toFiniteNumber(packageRecord.duration_type),
      duration: toFiniteNumber(packageRecord.duration),
      features: Array.isArray(packageRecord.features)
        ? packageRecord.features.map(OrganizationPackageFeatureModel.fromJson)
        : [],
      created_at: toStringValue(packageRecord.created_at),
    });
  }

  public static readonly example = OrganizationPackageModel.fromJson({
    id: 8,
    title: 'Professional Package',
    price: '500.00',
    price_after_discount: '450.00',
    discount_type: 1,
    discount_value: '10.00',
    duration_type: 3,
    duration: 3,
    features: [],
    created_at: '2026-07-29 11:50:26',
  });
}
