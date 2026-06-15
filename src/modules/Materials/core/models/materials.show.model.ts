import { UnitTypeEnum } from '../constant/unit.type.enum';
export default class MaterialsShowModel {
  public readonly price?: number;
  public readonly brandId?: number;
  public readonly translations: {
    title: Record<string, string>;
  };
  public readonly unit?: UnitTypeEnum;

  constructor(data: {
    price?: number;
    brandId?: number;
    unit?: UnitTypeEnum;
    translations: {
      title: Record<string, string>;
    };
  }) {
    this.price = data.price;
    this.brandId = data.brandId;
    this.unit = data.unit;
    this.translations = data.translations;
    Object.freeze(this);
  }

  static fromJson(json: any): MaterialsShowModel {
    if (!json) throw new Error('Invalid MaterialsShowModel data');

    return new MaterialsShowModel({
      price: json.price,
      brandId: json.brandId,
      unit: json.unit,
      translations: json.translations,
    });
  }

  static example: MaterialsShowModel = new MaterialsShowModel({
    price: 100,
    brandId: 1,
    unit: UnitTypeEnum.meter,
    translations: {
      title: {
        'ar': 'title',
        'en': 'title',
      },
    },
  });
}
