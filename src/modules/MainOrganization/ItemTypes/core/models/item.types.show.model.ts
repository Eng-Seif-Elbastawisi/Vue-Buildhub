import TranslationParams from '@/base/Core/Params/translationParams';
import { ItemTypeEnum } from '../constant/item.type.enum';

export default class ItemTypesModel {
  public readonly id?: number;
  public readonly title?: string;
  public readonly translations?: TranslationParams;
  public readonly code?: string;
  public readonly description?: string;
  public readonly type?: ItemTypeEnum;
  public readonly status: boolean;

  constructor(data: {
    id?: number;
    title?: string;
    translations?: TranslationParams;
    code?: string;
    description?: string;
    type?: ItemTypeEnum;
    status?: boolean;
  }) {
    this.id = data.id;
    this.title = data.title;
    this.translations = data.translations;
    this.code = data.code;
    this.description = data.description;
    this.type = data.type;
    this.status = data.status ?? false;

    Object.freeze(this);
  }

  static mapTranslations(translations: unknown, key: string = 'title'): Record<string, string> {
    if (!translations) return {};

    if (Array.isArray(translations)) {
      return translations.reduce<Record<string, string>>((result, translation) => {
        const item = translation as Record<string, string>;

        const locale = item.locale;
        const value = item[key];

        if (locale && value) {
          result[locale] = value;
        }

        return result;
      }, {});
    }

    const value = translations as {
      title?: Record<string, string>;
      description?: Record<string, string>;
    };

    return value?.[key as 'title' | 'description'] ?? {};
  }

  static getPlainTitle(json: Record<string, unknown>): string | undefined {
    const title = json.title;

    if (typeof title === 'string') {
      return title;
    }

    if (Array.isArray(title)) {
      const enTitle = title.find(
        (item) =>
          typeof item === 'object' &&
          item !== null &&
          (item as Record<string, unknown>).locale === 'en',
      ) as Record<string, unknown> | undefined;

      const arTitle = title.find(
        (item) =>
          typeof item === 'object' &&
          item !== null &&
          (item as Record<string, unknown>).locale === 'ar',
      ) as Record<string, unknown> | undefined;

      const firstTitle = title[0] as Record<string, unknown> | undefined;

      return (
        (enTitle?.title as string) || (arTitle?.title as string) || (firstTitle?.title as string)
      );
    }

    return undefined;
  }

  static getPlainDescription(json: Record<string, unknown>): string | undefined {
    const description = json.description;

    if (typeof description === 'string') {
      return description;
    }

    if (Array.isArray(description)) {
      const enDescription = description.find(
        (item) =>
          typeof item === 'object' &&
          item !== null &&
          (item as Record<string, unknown>).locale === 'en',
      ) as Record<string, unknown> | undefined;

      const arDescription = description.find(
        (item) =>
          typeof item === 'object' &&
          item !== null &&
          (item as Record<string, unknown>).locale === 'ar',
      ) as Record<string, unknown> | undefined;

      const firstDescription = description[0] as Record<string, unknown> | undefined;

      return (
        (enDescription?.description as string) ||
        (arDescription?.description as string) ||
        (firstDescription?.description as string)
      );
    }

    return undefined;
  }

  static fromJson(json: Record<string, unknown>): ItemTypesModel {
    if (!json) {
      throw new Error('Cannot create ItemTypesModel from null or undefined');
    }

    return new ItemTypesModel({
      id: json.id as number | undefined,

      title: ItemTypesModel.getPlainTitle(json),

      code: json.code as string | undefined,

      description: ItemTypesModel.getPlainDescription(json),

      type: json.type as ItemTypeEnum | undefined,
      status: json.status === true || Number(json.status) === 1,

      translations: new TranslationParams({
        title: ItemTypesModel.mapTranslations(json.translations ?? json.title, 'title'),

        description: ItemTypesModel.mapTranslations(
          json.translations ?? json.description,
          'description',
        ),
      }),
    });
  }

  static example = new ItemTypesModel({
    id: 1,

    title: 'Commercial project',

    code: 'COMMERCIAL',

    description: 'Commercial project type',

    type: ItemTypeEnum.PRODUCTS,
    status: true,

    translations: new TranslationParams({
      title: {
        ar: 'مشروع تجاري',
        en: 'Commercial project',
      },

      description: {
        ar: 'نوع مشروع تجاري',
        en: 'Commercial project type',
      },
    }),
  });
}
