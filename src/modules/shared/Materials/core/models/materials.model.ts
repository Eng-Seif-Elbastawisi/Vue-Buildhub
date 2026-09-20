import ItemTypesModel from '@/modules/MainOrganization/ItemTypes/core/models/item.types.model';
import StageModel from '@/modules/shared/Stages/core/models/stage.model';
import { UnitTypeEnum } from '../constant/unit.type.enum';

export default class MaterialsModel {
  public readonly id?: number;
  public readonly brandId?: number;
  public readonly price: number;
  public readonly title: string;
  public readonly unit: UnitTypeEnum;
  public readonly translations: { title: Record<string, string> };
  public readonly status: boolean;
  public readonly itemType?: ItemTypesModel;
  public readonly stage?: StageModel;
  public readonly subStage?: StageModel;

  constructor(data: {
    id?: number;
    translations: { title: Record<string, string> };
    unit: UnitTypeEnum;
    title: string;
    price: number;
    brandId?: number;
    itemType?: ItemTypesModel;
    stage?: StageModel;
    subStage?: StageModel;
    status?: boolean;
  }) {
    this.id = data.id;
    this.translations = data.translations;
    this.unit = data.unit;
    this.price = data.price;
    this.brandId = data.brandId;
    this.title = data.title;
    this.itemType = data.itemType;
    this.stage = data.stage;
    this.subStage = data.subStage;
    this.status = data.status ?? false;
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
      itemType: MaterialsModel.mapItemType(json.itemType ?? json.item_type),
      stage: MaterialsModel.mapStage(json.stage),
      subStage: MaterialsModel.mapStage(json.subStage ?? json.sub_stage),
      status: json.status === true || Number(json.status) === 1,
    });
  }

  private static mapItemType(itemType: unknown): ItemTypesModel | undefined {
    return itemType !== null && typeof itemType === 'object'
      ? ItemTypesModel.fromJson(itemType as Record<string, unknown>)
      : undefined;
  }

  private static mapStage(stage: unknown): StageModel | undefined {
    return stage !== null && typeof stage === 'object' ? StageModel.fromJson(stage) : undefined;
  }

  static example: MaterialsModel = new MaterialsModel({
    id: 10,
    translations: { title: { ar: 'مادة', en: 'Material' } },
    unit: UnitTypeEnum.meter,
    title: 'm',
    price: 100,
    status: true,
    brandId: 10,
    itemType: ItemTypesModel.example,
    stage: StageModel.fromJson({ id: 20, title: 'Stage' }),
    subStage: StageModel.fromJson({ id: 30, title: 'Sub-stage' }),
  });
}
