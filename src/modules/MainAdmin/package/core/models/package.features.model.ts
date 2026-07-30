import { FeaturesKEY, type FeaturesKEY as FeatureKey } from '../constants/features.enum';

export type PackageFeatureValue = number | boolean;

export interface PackageFeatureModelData {
  id?: number;
  key: FeatureKey;
  keyName: string;
  value: PackageFeatureValue;
}

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
};

const toOptionalNumber = (value: unknown): number | undefined => {
  if (value === null || value === undefined || value === '') {
    return undefined;
  }

  const parsedValue = Number(value);

  return Number.isFinite(parsedValue) ? parsedValue : undefined;
};

const toNumber = (value: unknown, fieldName: string): number => {
  const parsedValue = Number(value);

  if (!Number.isFinite(parsedValue)) {
    throw new Error(`Invalid package feature ${fieldName}`);
  }

  return parsedValue;
};

const toBoolean = (value: unknown): boolean => {
  if (value === true || value === 1 || value === '1' || value === 'true') {
    return true;
  }

  if (value === false || value === 0 || value === '0' || value === 'false') {
    return false;
  }

  throw new Error('Invalid package feature boolean value');
};

const isFeatureKey = (value: unknown): value is FeatureKey => {
  const key = Number(value);

  return Object.values(FeaturesKEY).includes(key as FeatureKey);
};

const isBooleanFeature = (key: FeatureKey): boolean => {
  return key === FeaturesKEY.HAS_MOBILE || key === FeaturesKEY.HAS_PORTAL;
};

const parseFeatureValue = (key: FeatureKey, value: unknown): PackageFeatureValue => {
  if (isBooleanFeature(key)) {
    return toBoolean(value);
  }

  return toNumber(value, 'value');
};

export default class PackageFeatureModel {
  public readonly id?: number;
  public readonly key: FeatureKey;
  public readonly keyName: string;
  public readonly value: PackageFeatureValue;

  constructor(data: PackageFeatureModelData) {
    this.id = data.id;
    this.key = data.key;
    this.keyName = data.keyName;
    this.value = data.value;

    Object.freeze(this);
  }

  public static fromJson(rawFeature: unknown): PackageFeatureModel {
    if (!isRecord(rawFeature)) {
      throw new Error('Cannot create PackageFeatureModel from invalid data');
    }

    if (!isFeatureKey(rawFeature.key)) {
      throw new Error('Invalid package feature key');
    }

    const key = Number(rawFeature.key) as FeatureKey;

    return new PackageFeatureModel({
      id: toOptionalNumber(rawFeature.id),

      key,

      keyName: typeof rawFeature.key_name === 'string' ? rawFeature.key_name : '',

      value: parseFeatureValue(key, rawFeature.value),
    });
  }
}
