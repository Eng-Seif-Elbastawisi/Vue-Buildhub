import { LocationTypeEnum } from '../constant/location.type.enum';

export default class LocationModel {
  public readonly id?: number;
  public readonly parentId?: number;
  public readonly type: LocationTypeEnum;
  public readonly code?: string;
  public readonly translations: { title: Record<string, string> };

  constructor(data: {
    id?: number;
    translations: { title: Record<string, string> };
    type: LocationTypeEnum;
    parentId?: number;
    code?: string;
  }) {
    this.id = data.id;
    this.translations = data.translations;
    this.type = data.type;
    this.parentId = data.parentId;
    this.code = data.code;
    Object.freeze(this);
  }

  static mapTranslations(translations: unknown, key: string = 'title'): Record<string, string> {
    if (!Array.isArray(translations)) {
      const value = translations as { title?: Record<string, string> } | undefined;
      return value?.title ?? (translations as Record<string, string>) ?? {};
    }

    return translations.reduce<Record<string, string>>((result, translation) => {
      const item = translation as Record<string, string>;
      if (item.locale && item[key]) result[item.locale] = item[key];
      return result;
    }, {});
  }

  static fromJson(json: Record<string, unknown>): LocationModel {
    if (!json) throw new Error('Cannot create LocationModel from null or undefined');

    return new LocationModel({
      id: json.id as number | undefined,
      translations: { title: LocationModel.mapTranslations(json.translations) },
      type: json.type as LocationTypeEnum,
      parentId: json.parent_id as number | undefined,
      code: json.code as string | undefined,
    });
  }

  static example: LocationModel = new LocationModel({
    id: 10,
    translations: { title: { ar: 'مادة', en: 'Material' } },
    type: LocationTypeEnum.building,
    parentId: 10,
    code: 'vvvv10',
  });
}
