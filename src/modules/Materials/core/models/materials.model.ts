import { UnitTypeEnum } from "../constant/unit.type.enum";

export default class MaterialsModel {
  public readonly brandId?: number;
  public readonly price: number;
  public readonly unit: UnitTypeEnum;
    public readonly translations: {
    title: Record<string, string>;
  };
  constructor(data: {
    id?: number;
    translations: {
      title: Record<string, string>;
    };
    unit: UnitTypeEnum;
    price: number;
    brandId: number;
  }) {
    this.translations = data.translations;
    this.unit = data.unit;
    this.price = data.price;
    this.brandId = data.brandId;
    Object.freeze(this);
  }

   static mapTranslations = (translations: any[], key: string = 'title') => {
    const result: Record<string, string> = {};
    if (Array.isArray(translations)) {
      translations.forEach((t: any) => {
        if (t.locale && t[key]) {
          result[t.locale] = t[key];
        }
      });
    }
    return result;
  };

  static fromJson(json: any): MaterialsModel {
    if (!json) {
      throw new Error('Cannot create MaterialsModel from null or undefined');
    }

    return new MaterialsModel({
      id: json.id,
      translations: MaterialsModel.mapTranslations(json.translations),
      unit: json.unit,
      price: json.price,
      brandId: json.brandId,
    });
  }

  static example: MaterialsModel = new MaterialsModel({
    id: 10,
    translations: {
      title: {
        'ar': 'Geberit',
        'en': 'Geberit',
      },
    },
    unit: UnitTypeEnum.meter,
    price: 100,
    brandId: 10,
  });
}
