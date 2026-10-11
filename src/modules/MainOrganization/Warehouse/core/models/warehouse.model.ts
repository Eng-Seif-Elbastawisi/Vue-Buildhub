import TranslationParams from '@/base/Core/Params/translationParams';

export default class WarehouseModel {
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

  static fromJson(json: Record<string, unknown>): WarehouseModel {
    if (!json) {
      throw new Error('Cannot create WarehouseModel from null or undefined');
    }

    return new WarehouseModel({
      id: json.id as number | undefined,
      title: json.title as string | undefined,

      translations: new TranslationParams({
        title: WarehouseModel.mapTranslations(json.translations),
      }),
    });
  }

  static example = new WarehouseModel({
    id: 1,
    title: 'Warehouse',
    translations: new TranslationParams({
      title: {
        ar: 'مستودع',
        en: 'Warehouse',
      },
    }),
  });
}
