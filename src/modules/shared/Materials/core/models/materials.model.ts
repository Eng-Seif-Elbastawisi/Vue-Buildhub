import { UnitTypeEnum } from '../constant/unit.type.enum';

export default class MaterialsModel {
  public readonly id?: number;
  public readonly brandId?: number;
  public readonly price: number;
  public readonly title:string;
  public readonly unit: UnitTypeEnum;
  public readonly translations: { title: Record<string, string> };
  public readonly itemTypeId?: number;
  public readonly stageId?: number;
  public readonly subStageId?: number;

  constructor(data: {
    id?: number;
    translations: { title: Record<string, string> };
    unit: UnitTypeEnum;
    title:string;
    price: number;
    brandId?: number;
    itemTypeId?: number;
    stageId?: number;
    subStageId?: number;
  }) {
    this.id = data.id;
    this.translations = data.translations;
    this.unit = data.unit;
    this.price = data.price;
    this.brandId = data.brandId;
    this.title = data.title;
    this.itemTypeId = data.itemTypeId;
    this.stageId = data.stageId;
    this.subStageId = data.subStageId;
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

  static fromJson(json: Record<string, unknown>): MaterialsModel {
    if (!json) throw new Error('Cannot create MaterialsModel from null or undefined');

    return new MaterialsModel({
      id: json.id as number | undefined,
      translations: { title: MaterialsModel.mapTranslations(json.translations) }, 
      unit: json.unit as UnitTypeEnum,
      title: json.title as string,
      price: Number(json.price),
      brandId: (json.brandId ?? json.brand_id) as number | undefined,
      itemTypeId: json.itemTypeId as number | undefined,
      stageId: json.stageId as number | undefined,
      subStageId: json.subStageId as number | undefined,
    });
  }

  static example: MaterialsModel = new MaterialsModel({
    id: 10,
    translations: { title: { ar: 'مادة', en: 'Material' } },
    unit: UnitTypeEnum.meter,
    title:'m',
    price: 100,
    brandId: 10,
  });
}
