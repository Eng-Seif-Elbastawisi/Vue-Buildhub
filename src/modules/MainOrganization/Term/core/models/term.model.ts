import TranslationParams from '@/base/Core/Params/translationParams';

export default class TermModel {
  public readonly id?: number;

  /**
   * القيمة التي سيعرضها الـ select.
   * نضع فيها description، ولو غير موجودة نستخدم title.
   */
  public readonly title?: string;

  public readonly description?: string;
  public readonly originalTitle?: string;
  public readonly translations?: TranslationParams;

  constructor(data: {
    id?: number;
    title?: string;
    description?: string;
    originalTitle?: string;
    translations?: TranslationParams;
  }) {
    this.id = data.id;
    this.title = data.title;
    this.description = data.description;
    this.originalTitle = data.originalTitle;
    this.translations = data.translations;

    Object.freeze(this);
  }

  static mapTranslations(
    translations: unknown,
    key: 'title' | 'description' = 'title',
  ): Record<string, string> {
    if (!translations) {
      return {};
    }

    if (Array.isArray(translations)) {
      return translations.reduce<Record<string, string>>((result, translation) => {
        if (!translation || typeof translation !== 'object') {
          return result;
        }

        const item = translation as Record<string, unknown>;

        const locale = typeof item.locale === 'string' ? item.locale : undefined;

        const value = typeof item[key] === 'string' ? item[key] : undefined;

        if (locale && value !== undefined) {
          result[locale] = value;
        }

        return result;
      }, {});
    }

    if (typeof translations === 'object') {
      const record = translations as Record<string, unknown>;
      const nestedValue = record[key];

      if (Array.isArray(nestedValue)) {
        return TermModel.mapTranslations(nestedValue, key);
      }

      if (nestedValue && typeof nestedValue === 'object') {
        return Object.entries(nestedValue as Record<string, unknown>).reduce<
          Record<string, string>
        >((result, [locale, value]) => {
          if (typeof value === 'string') {
            result[locale] = value;
          }

          return result;
        }, {});
      }

      return Object.entries(record).reduce<Record<string, string>>((result, [locale, value]) => {
        if (typeof value === 'string') {
          result[locale] = value;
        }

        return result;
      }, {});
    }

    return {};
  }

  static getPlainValue(value: unknown, key: 'title' | 'description'): string | undefined {
    if (typeof value === 'string') {
      return value;
    }

    if (!Array.isArray(value)) {
      return undefined;
    }

    const items = value.filter(
      (item): item is Record<string, unknown> => Boolean(item) && typeof item === 'object',
    );

    const englishValue = items.find((item) => item.locale === 'en')?.[key];

    const arabicValue = items.find((item) => item.locale === 'ar')?.[key];

    const firstValue = items[0]?.[key];

    if (typeof englishValue === 'string') {
      return englishValue;
    }

    if (typeof arabicValue === 'string') {
      return arabicValue;
    }

    if (typeof firstValue === 'string') {
      return firstValue;
    }

    return undefined;
  }

  static fromJson(json: Record<string, unknown>): TermModel {
    if (!json || typeof json !== 'object') {
      throw new Error('Cannot create TermModel from null or undefined');
    }

    const originalTitle = TermModel.getPlainValue(json.title, 'title');

    const description = TermModel.getPlainValue(json.description, 'description');

    const titleTranslations = TermModel.mapTranslations(json.translations ?? json.title, 'title');

    const descriptionTranslations = TermModel.mapTranslations(
      json.translations ?? json.description,
      'description',
    );

    return new TermModel({
      id: typeof json.id === 'number' ? json.id : undefined,

      /**
       * UpdatedCustomInputSelect يعرض title،
       * لذلك نضع description هنا.
       */
      title: description || originalTitle || '-',

      description,

      originalTitle,

      translations: new TranslationParams({
        title: titleTranslations,
        description: descriptionTranslations,
      }),
    });
  }

  static example = new TermModel({
    id: 1,

    title: 'First Term Description',
    originalTitle: 'First Term',
    description: 'First Term Description',

    translations: new TranslationParams({
      title: {
        ar: 'الفصل الأول',
        en: 'First Term',
      },

      description: {
        ar: 'وصف الفصل الأول',
        en: 'First Term Description',
      },
    }),
  });
}
