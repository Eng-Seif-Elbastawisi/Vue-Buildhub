import measurementModel from '@/modules/shared/measurement/core/models/measurement.model';
import { UnitTypeEnum } from '../constant/unit.type.enum';
import MaterialsModel from './materials.model';

export default class MaterialsShowModel {
  public readonly id?: number;
  public readonly price?: number;
   public readonly title?: string;
  public readonly brandId?: measurementModel;
  public readonly measurementId?: measurementModel;
  public readonly translations: { title: Record<string, string> };
  public readonly unit?: UnitTypeEnum;

  constructor(data: {
    id?: number;
    price?: number;
     title?: string;
    brandId?: measurementModel;
     measurementId?: measurementModel;
    unit?: UnitTypeEnum;
    translations: { title: Record<string, string> };
  }) {
    this.id = data.id;
    this.price = data.price;
     this.title = data.title;
    this.brandId = data.brandId;
     this.measurementId = data.measurementId;
    this.unit = data.unit;
    this.translations = data.translations;
    Object.freeze(this);
  }

  //   static mapTranslations(translations: unknown, key: string = 'title'): Record<string, string> {
  //   if (!Array.isArray(translations)) {
  //     const value = translations as { title?: Record<string, string> } | undefined;
  //     return value?.title ?? (translations as Record<string, string>) ?? {};
  //   }

  //   return translations.reduce<Record<string, string>>((result, translation) => {
  //     const item = translation as Record<string, string>;
  //     if (item.locale && item[key]) result[item.locale] = item[key];
  //     return result;
  //   }, {});
  // }

  static fromJson(json: Record<string, unknown>): MaterialsShowModel {
    if (!json) throw new Error('Invalid MaterialsShowModel data');

    return new MaterialsShowModel({
      id: json.id as number | undefined,
      price: Number(json.price),
      // brandId: (json.brandId ?? json.brand_id) as measurementModel | undefined,
      brandId: json.brand as measurementModel | undefined,
      measurementId: json.measurement_unit as measurementModel | undefined,
      unit: json.unit as UnitTypeEnum | undefined,
       title: json.title as string | undefined,
      translations: { title: MaterialsModel.mapTranslations(json.title) },
    });
  }

  static example: MaterialsShowModel = new MaterialsShowModel({
    id: 1,
    price: 100,
    title: 'مادة',
    brandId: measurementModel.example,
    unit: UnitTypeEnum.meter,
     measurementId: measurementModel.example,
    translations: { title: { ar: 'مادة', en: 'Material' } },
  });
}
