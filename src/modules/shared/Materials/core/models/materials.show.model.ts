import { UnitTypeEnum } from '../constant/unit.type.enum';
import MaterialsModel from './materials.model';

export default class MaterialsShowModel {
  public readonly id?: number;
  public readonly price?: number;
   public readonly title?: string;
  public readonly brandId?: number;
  public readonly translations: { title: Record<string, string> };
  public readonly unit?: UnitTypeEnum;

  constructor(data: {
    id?: number;
    price?: number;
     title?: string;
    brandId?: number;
    unit?: UnitTypeEnum;
    translations: { title: Record<string, string> };
  }) {
    this.id = data.id;
    this.price = data.price;
     this.title = data.title;
    this.brandId = data.brandId;
    this.unit = data.unit;
    this.translations = data.translations;
    Object.freeze(this);
  }

  static fromJson(json: Record<string, unknown>): MaterialsShowModel {
    if (!json) throw new Error('Invalid MaterialsShowModel data');

    return new MaterialsShowModel({
      id: json.id as number | undefined,
      price: Number(json.price),
      brandId: (json.brandId ?? json.brand_id) as number | undefined,
      unit: json.unit as UnitTypeEnum | undefined,
       title: json.title as string | undefined,
      translations: { title: MaterialsModel.mapTranslations(json.translations) },
    });
  }

  static example: MaterialsShowModel = new MaterialsShowModel({
    id: 1,
    price: 100,
    title: 'مادة',
    brandId: 1,
    unit: UnitTypeEnum.meter,
    translations: { title: { ar: 'مادة', en: 'Material' } },
  });
}
