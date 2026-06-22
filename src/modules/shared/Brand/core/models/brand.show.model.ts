import { BrandTypeEnum } from '../constant/Brand.type.enum';
import BrandModel from './brand.model';

export default class BrandShowModel {
  public readonly id?: number;
  public readonly translations: { title: Record<string, string> };
  public readonly type?: BrandTypeEnum;

  constructor(data: {
    id?: number;
    translations: { title: Record<string, string> };
    type?: BrandTypeEnum;
  }) {
    this.id = data.id;
    this.translations = data.translations;
    this.type = data.type;
    Object.freeze(this);
  }

  static fromJson(json: any): BrandShowModel {
    if (!json) throw new Error('Invalid BrandShowModel data');

    return new BrandShowModel({
      id: json.id,
      translations: {
        title: BrandModel.mapTranslations(json.translations, json.title),
      },
      type: json.type,
    });
  }

  static example: BrandShowModel = new BrandShowModel({
    id: 1,
    translations: { title: { en: 'Brand', ar: 'علامة تجارية' } },
    type: BrandTypeEnum.SUPPLIES,
  });
}
