import TranslationParams from '@/base/Core/Params/translationParams';

export default class AttachmentTypeShowModel {
  public readonly id?: number;
  public readonly title?: string;
  public readonly translations?: TranslationParams;

  constructor(data: {
    id?: number;
    title?: string;
    translations?: TranslationParams;
  }) {
    this.id = data.id;
    this.title = data.title;
    this.translations = data.translations;

    Object.freeze(this);
  }

  static mapTranslations(
    translations: unknown,
    key: string = 'title',
  ): Record<string, string> {
    if (!translations) return {};

    if (!Array.isArray(translations)) {
      const value = translations as Record<string, unknown>;

      if (value[key] && typeof value[key] === 'object') {
        return value[key] as Record<string, string>;
      }

      return translations as Record<string, string>;
    }

    return translations.reduce<Record<string, string>>(
      (result, translation) => {
        const item = translation as Record<string, string>;

        if (item.locale && item[key]) {
          result[item.locale] = item[key];
        }

        return result;
      },
      {},
    );
  }

  static fromJson(json: Record<string, unknown>): AttachmentTypeShowModel {
    if (!json) {
      throw new Error(
        'Cannot create AttachmentTypeShowModel from null or undefined',
      );
    }

    const titleTranslations = Array.isArray(json.title)
      ? AttachmentTypeShowModel.mapTranslations(json.title, 'title')
      : AttachmentTypeShowModel.mapTranslations(json.translations, 'title');

    return new AttachmentTypeShowModel({
      id: json.id as number | undefined,

      title:
        typeof json.title === 'string'
          ? json.title
          : titleTranslations.en ?? titleTranslations.ar,

      translations: new TranslationParams({
        title: titleTranslations,
      }),
    });
  }

  static example = new AttachmentTypeShowModel({
    id: 1,
    title: 'Architectural Plan',
    translations: new TranslationParams({
      title: {
        ar: 'مخطط معماري',
        en: 'Architectural Plan',
      },
    }),
  });
}