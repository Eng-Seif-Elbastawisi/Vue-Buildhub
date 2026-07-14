import TranslationParams from '@/base/Core/Params/translationParams';

export default class TermModel {
  public readonly id?: number;
  public readonly title?: string;
  public readonly description?: string;
  public readonly translations?: TranslationParams;

  constructor(data: {
    id?: number;
    title?: string;
    description?: string;
    translations?: TranslationParams;
  }) {
    this.id = data.id;
    this.title = data.title;
    this.description = data.description;
    this.translations = data.translations;

    Object.freeze(this);
  }

  static mapTranslations(
    translations: unknown,
    key: 'title' | 'description',
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

        const translatedValue = typeof item[key] === 'string' ? item[key] : undefined;

        if (locale && translatedValue !== undefined) {
          result[locale] = translatedValue;
        }

        return result;
      }, {});
    }

    if (typeof translations === 'object') {
      const translationObject = translations as Record<string, unknown>;

      if (Array.isArray(translationObject[key])) {
        return TermModel.mapTranslations(translationObject[key], key);
      }

      const nestedTranslations = translationObject[key];

      if (
        nestedTranslations &&
        typeof nestedTranslations === 'object' &&
        !Array.isArray(nestedTranslations)
      ) {
        return Object.entries(nestedTranslations as Record<string, unknown>).reduce<
          Record<string, string>
        >((result, [locale, value]) => {
          if (typeof value === 'string') {
            result[locale] = value;
          }

          return result;
        }, {});
      }

      return Object.entries(translationObject).reduce<Record<string, string>>(
        (result, [locale, value]) => {
          if (typeof value === 'string') {
            result[locale] = value;
          }

          return result;
        },
        {},
      );
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

    const translations = value.filter(
      (item): item is Record<string, unknown> => Boolean(item) && typeof item === 'object',
    );

    const currentValue =
      translations.find((item) => item.locale === 'en')?.[key] ??
      translations.find((item) => item.locale === 'ar')?.[key] ??
      translations[0]?.[key];

    return typeof currentValue === 'string' ? currentValue : undefined;
  }

  static fromJson(json: Record<string, unknown>): TermModel {
    if (!json || typeof json !== 'object') {
      throw new Error('Cannot create TermModel from null or undefined');
    }

    const titleTranslations = TermModel.mapTranslations(json.title, 'title');

    const descriptionTranslations = TermModel.mapTranslations(json.description, 'description');

    return new TermModel({
      id: typeof json.id === 'number' ? json.id : undefined,

      title: TermModel.getPlainValue(json.title, 'title'),

      description: TermModel.getPlainValue(json.description, 'description'),

      translations: new TranslationParams({
        title: titleTranslations,
        description: descriptionTranslations,
      }),
    });
  }

  static example = new TermModel({
    id: 1,
    title: 'First Term',
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
