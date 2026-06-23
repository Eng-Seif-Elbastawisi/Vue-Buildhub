import { LocationTypeEnum } from '../constant/location.type.enum';
import LocationModel from './location.model';

export default class LocationShowModel {
  public readonly id?: number;
  public readonly parentId?: number;
  public readonly type?: LocationTypeEnum;
  public readonly code?: string;
  public readonly translations: { title: Record<string, string> };

  constructor(data: {
    id?: number;
    parentId?: number;
    type?: LocationTypeEnum;
    code?: string;
    translations: { title: Record<string, string> };
  }) {
    this.id = data.id;
    this.parentId = data.parentId;
    this.type = data.type;
    this.code = data.code;
    this.translations = data.translations;
    Object.freeze(this);
  }

  static fromJson(json: Record<string, unknown>): LocationShowModel {
  return new LocationShowModel({
    id: json.id as number,
    parentId: json.parent_id as number | undefined,
    type: json.type as LocationTypeEnum,
    code: json.code as string | undefined,

    translations: {
      title: LocationModel.mapTranslations(json.title),
    },
  });
}

  static example: LocationShowModel = new LocationShowModel({
    id: 1,
    parentId: 10,
    type: LocationTypeEnum.CITY,
    code: 'vvvv10',
    translations: { title: { ar: 'مادة', en: 'Material' } },
  });
}
