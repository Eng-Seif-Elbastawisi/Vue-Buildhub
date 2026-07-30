import type { DiscountType } from '../constants/discount.type.enum';
import type { DurationType } from '../constants/duration.type.enum';
import { FeaturesKEY } from '../constants/features.enum';

import PackageFeatureModel from './package.features.model';

export interface PackageAdminModel {
  id: number;
  name: string;
}

interface PackageShowModelData {
  id?: number;
  admin?: PackageAdminModel;
  translations: {
    title: Record<string, string>;
  };
  price: string;
  price_after_discount: string;
  discount_type: DiscountType;
  discount_value: string;
  duration_type: DurationType;
  duration: number;
  features: PackageFeatureModel[];
  created_at: string;
}

export default class PackageShowModel {
  public readonly id?: number;
  public readonly admin?: PackageAdminModel;

  public readonly translations: {
    title: Record<string, string>;
  };

  public readonly price: string;
  public readonly price_after_discount: string;
  public readonly discount_type: DiscountType;
  public readonly discount_value: string;
  public readonly duration_type: DurationType;
  public readonly duration: number;
  public readonly features: PackageFeatureModel[];
  public readonly created_at: string;

  constructor(data: PackageShowModelData) {
    this.id = data.id;
    this.admin = data.admin;
    this.translations = data.translations;
    this.price = data.price;
    this.price_after_discount = data.price_after_discount;
    this.discount_type = data.discount_type;
    this.discount_value = data.discount_value;
    this.duration_type = data.duration_type;
    this.duration = data.duration;
    this.features = data.features;
    this.created_at = data.created_at;

    if (this.admin) {
      Object.freeze(this.admin);
    }

    Object.freeze(this.translations.title);
    Object.freeze(this.translations);
    Object.freeze(this.features);
    Object.freeze(this);
  }

  public static mapTranslations(
    translations: unknown,
    key = 'title',
    fallbackValue?: unknown,
  ): Record<string, string> {
    const fallback =
      fallbackValue !== null && fallbackValue !== undefined ? String(fallbackValue) : '';

    if (!translations) {
      return fallback ? { en: fallback } : {};
    }

    /*
     * الحالة الأولى:
     *
     * translations: [
     *   { locale: 'ar', title: 'الباقة الأساسية' },
     *   { locale: 'en', title: 'Basic Package' },
     * ]
     */
    if (Array.isArray(translations)) {
      const result = translations.reduce<Record<string, string>>(
        (mappedTranslations, translation) => {
          if (!translation || typeof translation !== 'object' || Array.isArray(translation)) {
            return mappedTranslations;
          }

          const item = translation as Record<string, unknown>;

          const locale = String(item.locale ?? item.language ?? item.lang ?? '');

          const value = item[key];

          if (locale && value !== undefined && value !== null) {
            mappedTranslations[locale] = String(value);
          }

          return mappedTranslations;
        },
        {},
      );

      if (Object.keys(result).length > 0) {
        return result;
      }

      return fallback ? { en: fallback } : {};
    }

    if (typeof translations !== 'object' || translations === null) {
      return fallback ? { en: fallback } : {};
    }

    const translationsRecord = translations as Record<string, unknown>;

    /*
     * الحالة الثانية:
     *
     * translations: {
     *   title: {
     *     ar: 'الباقة الأساسية',
     *     en: 'Basic Package',
     *   },
     * }
     */
    const nestedTranslations = translationsRecord[key];

    if (
      nestedTranslations &&
      typeof nestedTranslations === 'object' &&
      !Array.isArray(nestedTranslations)
    ) {
      return Object.entries(nestedTranslations as Record<string, unknown>).reduce<
        Record<string, string>
      >((mappedTranslations, [locale, value]) => {
        if (value !== undefined && value !== null) {
          mappedTranslations[locale] = String(value);
        }

        return mappedTranslations;
      }, {});
    }

    /*
     * الحالة الثالثة:
     *
     * translations: {
     *   ar: 'الباقة الأساسية',
     *   en: 'Basic Package',
     * }
     */
    const directTranslations = Object.entries(translationsRecord).reduce<Record<string, string>>(
      (mappedTranslations, [locale, value]) => {
        if (value !== undefined && value !== null && typeof value !== 'object') {
          mappedTranslations[locale] = String(value);
        }

        return mappedTranslations;
      },
      {},
    );

    if (Object.keys(directTranslations).length > 0) {
      return directTranslations;
    }

    return fallback ? { en: fallback } : {};
  }

  private getFeatureValue(key: FeaturesKEY): number | boolean | undefined {
    return this.features.find((feature) => Number(feature.key) === Number(key))?.value;
  }

  public get employeenumbers(): number {
    const value = this.getFeatureValue(FeaturesKEY.NUMBER_OF_EMPLOYEES);

    return typeof value === 'number' ? value : 0;
  }

  public get hasmobild(): boolean {
    return this.getFeatureValue(FeaturesKEY.HAS_MOBILE) === true;
  }

  public get hasportal(): boolean {
    return this.getFeatureValue(FeaturesKEY.HAS_PORTAL) === true;
  }

  public get projectnumbers(): number {
    const value = this.getFeatureValue(FeaturesKEY.NUMBER_OF_PROJECTS);

    return typeof value === 'number' ? value : 0;
  }

  public static fromJson(json: Record<string, unknown>): PackageShowModel {
    const admin =
      json.admin && typeof json.admin === 'object' && !Array.isArray(json.admin)
        ? (json.admin as Record<string, unknown>)
        : null;

    return new PackageShowModel({
      id: json.id !== null && json.id !== undefined ? Number(json.id) : undefined,

      admin: admin
        ? {
            id: Number(admin.id ?? 0),
            name: String(admin.name ?? ''),
          }
        : undefined,

      translations: {
        title: PackageShowModel.mapTranslations(json.title ?? json.translations, 'title'),
      },
      price: String(json.price ?? '0'),

      price_after_discount: String(json.price_after_discount ?? json.price ?? '0'),

      discount_type: Number(json.discount_type ?? 0) as DiscountType,

      discount_value: String(json.discount_value ?? '0'),

      duration_type: Number(json.duration_type ?? 0) as DurationType,

      duration: Number(json.duration ?? 0),

      features: Array.isArray(json.features)
        ? json.features
            .filter(
              (feature): feature is Record<string, unknown> =>
                feature !== null && typeof feature === 'object' && !Array.isArray(feature),
            )
            .map((feature) => PackageFeatureModel.fromJson(feature))
        : [],

      created_at: String(json.created_at ?? ''),
    });
  }

  public static readonly example = new PackageShowModel({
    id: 8,

    admin: {
      id: 3,
      name: 'Techlab Admin',
    },

    translations: {
      title: {
        ar: 'الباقة الأساسية',
        en: 'Basic Package',
      },
    },

    price: '500.00',

    price_after_discount: '450.00',

    discount_type: 1 as DiscountType,

    discount_value: '10.00',

    duration_type: 1 as DurationType,

    duration: 3,

    features: [
      new PackageFeatureModel({
        id: 29,
        key: FeaturesKEY.NUMBER_OF_EMPLOYEES,
        keyName: 'NUMBER_OF_EMPLOYEES',
        value: 3,
      }),

      new PackageFeatureModel({
        id: 30,
        key: FeaturesKEY.HAS_MOBILE,
        keyName: 'HAS_MOBILE',
        value: true,
      }),

      new PackageFeatureModel({
        id: 31,
        key: FeaturesKEY.HAS_PORTAL,
        keyName: 'HAS_PORTAL',
        value: true,
      }),

      new PackageFeatureModel({
        id: 32,
        key: FeaturesKEY.NUMBER_OF_PROJECTS,
        keyName: 'NUMBER_OF_PROJECTS',
        value: 33,
      }),
    ],

    created_at: '2026-07-29 11:50:26',
  });
}
