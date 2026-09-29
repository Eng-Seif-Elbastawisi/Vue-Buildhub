import TranslationParams from '@/base/Core/Params/translationParams';

export default class AttachmentTypeModel {
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

    if (!Array.isArray(translations)) {
      const value = translations as { title?: Record<string, string> };
      return value?.title ?? (translations as Record<string, string>) ?? {};
    }

    return translations.reduce<Record<string, string>>((result, translation) => {
      const item = translation as Record<string, string>;
      if (item.locale && item[key]) {
        result[item.locale] = item[key];
      }
      return result;
    }, {});
  }

  static fromJson(json: Record<string, unknown>): AttachmentTypeModel {
    if (!json) {
      throw new Error('Cannot create AttachmentTypeModel from null or undefined');
    }

    return new AttachmentTypeModel({
      id: json.id as number | undefined,
      title: json.title as string | undefined,
      translations: new TranslationParams({
        title: AttachmentTypeModel.mapTranslations(json.translations),
      }),
    });
  }

  static example = new AttachmentTypeModel({
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
