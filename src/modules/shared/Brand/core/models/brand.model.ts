import { BrandTypeEnum } from '../constant/Brand.type.enum';

export default class BrandModel {
  public readonly id?: number;
  public readonly title?: string;
  public readonly translations: { title: Record<string, string> };
  public readonly type: BrandTypeEnum;
  constructor(data: {
    id?: number;
    title?: string;
    translations: { title: Record<string, string> };
    type: BrandTypeEnum;
  }) {
    this.id = data.id;
    this.title = data.title;
    this.translations = data.translations;
    this.type = data.type;
    Object.freeze(this);
  }

  static fromJson(json: any): BrandModel {
    if (!json) {
      throw new Error('Cannot create BrandModel from null or undefined');
    }

    return new BrandModel({
      id: json.id,
      title: json.title,
      translations: {
        title: BrandModel.mapTranslations(json.translations, json.title),
      },
      type: json.type,
    });
  }

  static mapTranslations(translations: unknown, fallbackTitle?: unknown): Record<string, string> {
    const source = translations ?? fallbackTitle;
    const nestedTitle =
      source && typeof source === 'object' && 'title' in source
        ? (source as { title?: unknown }).title
        : source;

    if (Array.isArray(nestedTitle)) {
      return nestedTitle.reduce<Record<string, string>>((result, translation) => {
        const item = translation as { locale?: string; title?: string };
        if (item.locale && item.title) result[item.locale] = item.title;
        return result;
      }, {});
    }

    if (nestedTitle && typeof nestedTitle === 'object') {
      return Object.fromEntries(
        Object.entries(nestedTitle).filter(
          (entry): entry is [string, string] => typeof entry[1] === 'string',
        ),
      );
    }

    return typeof nestedTitle === 'string' ? { en: nestedTitle } : {};
  }

  static example: BrandModel = new BrandModel({
    id: 10,
    translations: { title: { en: 'Geberit' } },
    type: BrandTypeEnum.SUPPLIES,
  });
}
