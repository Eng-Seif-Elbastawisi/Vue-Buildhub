import { LocationTypeEnum } from '../constant/location.type.enum';
import LocationModel from './location.model';

type LocationParentModel = {
  id: number;
  type?: LocationTypeEnum;
  title: string;
  parent?: LocationParentModel | null;
};

export default class LocationShowModel {
  public readonly id?: number;
  public readonly parent?: LocationParentModel | null;
  public readonly type?: LocationTypeEnum;
  public readonly code?: string;
  public readonly translations: { title: Record<string, string> };

  constructor(data: {
    id?: number;
    parent?: LocationParentModel | null;
    type?: LocationTypeEnum;
    code?: string;
    translations: { title: Record<string, string> };
  }) {
    this.id = data.id;
    this.parent = data.parent;
    this.type = data.type;
    this.code = data.code;
    this.translations = data.translations;

    Object.freeze(this);
  }

  private static getTitle(title: unknown): string {
    if (!title) return '';

    if (typeof title === 'string') {
      return title;
    }

    if (Array.isArray(title)) {
      const enTitle = title.find((item: any) => item.locale === 'en')?.title;
      const firstTitle = title[0]?.title;

      return enTitle || firstTitle || '';
    }

    return '';
  }

  private static mapParent(parent: any): LocationParentModel | null {
    if (!parent) return null;

    return {
      id: Number(parent.id),
      type: parent.type as LocationTypeEnum | undefined,
      title: LocationShowModel.getTitle(parent.title),
      parent: parent.parent ? LocationShowModel.mapParent(parent.parent) : null,
    };
  }

  static fromJson(json: Record<string, unknown>): LocationShowModel {
    return new LocationShowModel({
      id: json.id as number,
      parent: LocationShowModel.mapParent(json.parent),
      type: json.type as LocationTypeEnum,
      code: json.code as string | undefined,
      translations: {
        title: LocationModel.mapTranslations(json.title),
      },
    });
  }

  static example: LocationShowModel = new LocationShowModel({
    id: 1,
    parent: {
      id: 11,
      type: LocationTypeEnum.GOVERNORATE,
      title: 'Cairo Governorate',
      parent: {
        id: 8,
        type: LocationTypeEnum.COUNTRY,
        title: 'Egypt',
        parent: null,
      },
    },
    type: LocationTypeEnum.CITY,
    code: 'vvvv10',
    translations: {
      title: {
        ar: 'مدينة',
        en: 'City',
      },
    },
  });
}
