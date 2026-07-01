import TranslationParams from '@/base/Core/Params/translationParams';

export default class SpaceModel {
  public readonly id?: number;
  public readonly title?: string;
  public readonly translations?: TranslationParams;

  constructor(data: { id?: number; title?: string; translations?: TranslationParams }) {
    this.id = data.id;
    this.title = data.title;
    this.translations = data.translations;

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
    };

    return value?.title ?? (translations as Record<string, string>) ?? {};
  }

  static getPlainTitle(json: Record<string, unknown>): string | undefined {
    const title = json.title;

    if (typeof title === 'string') {
      return title;
    }

    if (Array.isArray(title)) {
      const enTitle = title.find((item) => item?.locale === 'en')?.title;
      const arTitle = title.find((item) => item?.locale === 'ar')?.title;
      const firstTitle = title[0]?.title;

      return enTitle || arTitle || firstTitle;
    }

    return undefined;
  }

  static fromJson(json: Record<string, unknown>): SpaceModel {
    if (!json) {
      throw new Error('Cannot create SpaceModel from null or undefined');
    }

    return new SpaceModel({
      id: json.id as number | undefined,

      title: SpaceModel.getPlainTitle(json),

      translations: new TranslationParams({
        title: SpaceModel.mapTranslations(json.translations ?? json.title),
      }),
    });
  }

  static example = new SpaceModel({
    id: 1,
    title: 'Commercial project',
    translations: new TranslationParams({
      title: {
        ar: 'مشروع تجاري',
        en: 'Commercial project',
      },
    }),
  });
}
