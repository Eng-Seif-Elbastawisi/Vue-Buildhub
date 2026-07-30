import {
  DiscountType,
  type DiscountType as DiscountTypeValue,
} from '../constants/discount.type.enum';
import {
  DurationType,
  getDurationTypeNameKey,
  type DurationType as DurationTypeValue,
} from '../constants/duration.type.enum';
import {
  getPackageSubscriptionStatusLabel,
  isPackageSubscriptionStatus,
  PackageSubscriptionStatus,
  type PackageSubscriptionStatus as PackageSubscriptionStatusValue,
} from '../constants/package.subscription.status.enum';
import { translate } from '@/locales/i18n';

export interface PackageSubscriptionPackageModel {
  id: number;
  title: string;
  price: string;
  price_after_discount: string;
  discount_type: DiscountTypeValue;
  discount_value: string;
  duration_type: DurationTypeValue;
  duration: number;
  created_at: string;
}

export interface PackageSubscriptionOrganizationModel {
  id: number;
  name: string;
}

export interface PackageSubscriptionEmployeeModel {
  id: number;
  name: string;
}

export interface PackageSubscriptionAdminModel {
  id: number;
  name: string;
}

interface PackageSubscriptionModelData {
  id: number;
  package: PackageSubscriptionPackageModel;
  organization: PackageSubscriptionOrganizationModel;
  organization_employee: PackageSubscriptionEmployeeModel;
  admin: PackageSubscriptionAdminModel;
  status: PackageSubscriptionStatusValue;
  notes: string;
  created_at: string;
}

const EMPTY_LABEL = '-';

const isRecord = (rawValue: unknown): rawValue is Record<string, unknown> =>
  rawValue !== null && typeof rawValue === 'object' && !Array.isArray(rawValue);

const parseNumber = (rawValue: unknown, fallback = 0): number => {
  const numericValue = Number(rawValue);

  return Number.isFinite(numericValue) ? numericValue : fallback;
};

const parseString = (rawValue: unknown): string =>
  rawValue !== null && rawValue !== undefined ? String(rawValue) : '';

const isDurationTypeValue = (rawDurationType: number): rawDurationType is DurationTypeValue =>
  Object.values(DurationType).some((durationType) => durationType === rawDurationType);

const isDiscountTypeValue = (rawDiscountType: number): rawDiscountType is DiscountTypeValue =>
  Object.values(DiscountType).some((discountType) => discountType === rawDiscountType);

const parseDurationType = (rawDurationType: unknown): DurationTypeValue => {
  const numericValue = parseNumber(rawDurationType, DurationType.DAY);

  return isDurationTypeValue(numericValue) ? numericValue : DurationType.DAY;
};

const parseDiscountType = (rawDiscountType: unknown): DiscountTypeValue => {
  const numericValue = parseNumber(rawDiscountType, DiscountType.PERCENTAGE);

  return isDiscountTypeValue(numericValue) ? numericValue : DiscountType.PERCENTAGE;
};

const parseStatus = (rawStatus: unknown): PackageSubscriptionStatusValue => {
  const numericValue = parseNumber(rawStatus, PackageSubscriptionStatus.PENDING);

  return isPackageSubscriptionStatus(numericValue)
    ? numericValue
    : PackageSubscriptionStatus.PENDING;
};

const parseNamedEntity = (rawEntity: unknown): PackageSubscriptionOrganizationModel => {
  const record = isRecord(rawEntity) ? rawEntity : {};

  return {
    id: parseNumber(record.id),
    name: parseString(record.name),
  };
};

const parsePackage = (rawPackage: unknown): PackageSubscriptionPackageModel => {
  const record = isRecord(rawPackage) ? rawPackage : {};

  return {
    id: parseNumber(record.id),
    title: parseString(record.title),
    price: parseString(record.price),
    price_after_discount: parseString(record.price_after_discount),
    discount_type: parseDiscountType(record.discount_type),
    discount_value: parseString(record.discount_value),
    duration_type: parseDurationType(record.duration_type),
    duration: parseNumber(record.duration),
    created_at: parseString(record.created_at),
  };
};

const valueOrEmpty = (displayValue: string | number): string => {
  const normalizedValue = String(displayValue).trim();

  return normalizedValue.length > 0 ? normalizedValue : EMPTY_LABEL;
};

export default class PackageSubscriptionModel {
  public readonly id: number;
  public readonly package: PackageSubscriptionPackageModel;
  public readonly organization: PackageSubscriptionOrganizationModel;
  public readonly organization_employee: PackageSubscriptionEmployeeModel;
  public readonly admin: PackageSubscriptionAdminModel;
  public readonly status: PackageSubscriptionStatusValue;
  public readonly notes: string;
  public readonly created_at: string;

  constructor(data: PackageSubscriptionModelData) {
    this.id = data.id;
    this.package = data.package;
    this.organization = data.organization;
    this.organization_employee = data.organization_employee;
    this.admin = data.admin;
    this.status = data.status;
    this.notes = data.notes;
    this.created_at = data.created_at;

    Object.freeze(this.package);
    Object.freeze(this.organization);
    Object.freeze(this.organization_employee);
    Object.freeze(this.admin);
    Object.freeze(this);
  }

  public get packageTitle(): string {
    return valueOrEmpty(this.package.title);
  }

  public get organizationName(): string {
    return valueOrEmpty(this.organization.name);
  }

  public get employeeName(): string {
    return valueOrEmpty(this.organization_employee.name);
  }

  public get adminName(): string {
    return valueOrEmpty(this.admin.name);
  }

  public get originalPrice(): string {
    return valueOrEmpty(this.package.price);
  }

  public get priceAfterDiscount(): string {
    return valueOrEmpty(this.package.price_after_discount);
  }

  public get statusLabel(): string {
    return getPackageSubscriptionStatusLabel(this.status);
  }

  public get durationDisplay(): string {
    if (this.package.duration <= 0) {
      return EMPTY_LABEL;
    }

    return `${this.package.duration} ${translate(getDurationTypeNameKey(this.package.duration_type))}`;
  }

  public static fromJson(json: Record<string, unknown>): PackageSubscriptionModel {
    return new PackageSubscriptionModel({
      id: parseNumber(json.id),
      package: parsePackage(json.package),
      organization: parseNamedEntity(json.organization),
      organization_employee: parseNamedEntity(json.organization_employee),
      admin: parseNamedEntity(json.admin),
      status: parseStatus(json.status),
      notes: parseString(json.notes),
      created_at: parseString(json.created_at),
    });
  }

  public static readonly example = new PackageSubscriptionModel({
    id: 1,
    package: {
      id: 4,
      title: 'Professional Package Updated',
      price: '1500.00',
      price_after_discount: '1350.00',
      discount_type: DiscountType.PERCENTAGE,
      discount_value: '10.00',
      duration_type: DurationType.MONTH,
      duration: 6,
      created_at: '2026-07-26 07:35:43',
    },
    organization: {
      id: 14,
      name: 'Tech Company2',
    },
    organization_employee: {
      id: 16,
      name: 'Tech Company2_employee',
    },
    admin: {
      id: 1,
      name: 'Techlab Admin',
    },
    status: PackageSubscriptionStatus.CONFIRMED,
    notes: 'zzzzz',
    created_at: '2026-07-29 06:44:24',
  });
}
