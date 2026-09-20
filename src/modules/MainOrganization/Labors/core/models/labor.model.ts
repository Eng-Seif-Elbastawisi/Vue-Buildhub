import TitleModel from '@/base/Core/Models/titleModel';
import { UnitTypeEnum } from '@/modules/shared/Materials/core/constant/unit.type.enum';
import StageModel from '@/modules/shared/Stages/core/models/stage.model';

export default class LaborModel {
  public readonly id?: number;
  public readonly price: number;
  public readonly title: string;
  public readonly unit: UnitTypeEnum;
  public readonly translations: { title: Record<string, string> };
  public readonly status: boolean;
  public readonly itemType?: TitleModel;
  public readonly stage?: StageModel;
  public readonly subStage?: StageModel;

  constructor(labor: {
    id?: number;
    translations: { title: Record<string, string> };
    unit: UnitTypeEnum;
    title: string;
    price: number;
    status?: boolean;
    itemType?: TitleModel;
    stage?: StageModel;
    subStage?: StageModel;
  }) {
    this.id = labor.id;
    this.translations = labor.translations;
    this.unit = labor.unit;
    this.price = labor.price;
    this.title = labor.title;
    this.status = labor.status ?? false;
    this.itemType = labor.itemType;
    this.stage = labor.stage;
    this.subStage = labor.subStage;
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

  static fromJson(json: Record<string, unknown>): LaborModel {
    if (!json) throw new Error('Cannot create LaborModel from null or undefined');

    return new LaborModel({
      id: json.id as number | undefined,
      translations: { title: LaborModel.mapTranslations(json.translations) },
      unit: json.unit as UnitTypeEnum,
      title: json.title as string,
      price: Number(json.price),
      status: json.status === true || Number(json.status) === 1,
      itemType: LaborModel.mapTitleRelation(json.itemType ?? json.item_type),
      stage: LaborModel.mapStageRelation(json.stage),
      subStage: LaborModel.mapStageRelation(json.subStage ?? json.sub_stage),
    });
  }

  private static mapTitleRelation(relation: unknown): TitleModel | undefined {
    const relationData = LaborModel.toRelationData(relation);
    return relationData ? TitleModel.fromMap(relationData) : undefined;
  }

  private static mapStageRelation(relation: unknown): StageModel | undefined {
    const relationData = LaborModel.toRelationData(relation);
    return relationData ? StageModel.fromJson(relationData) : undefined;
  }

  private static toRelationData(relation: unknown): Record<string, unknown> | undefined {
    return relation !== null && typeof relation === 'object'
      ? (relation as Record<string, unknown>)
      : undefined;
  }

  static example: LaborModel = new LaborModel({
    id: 10,
    translations: { title: { ar: 'مصنعية', en: 'Labor' } },
    unit: UnitTypeEnum.meter,
    title: 'Labor',
    price: 100,
    status: true,
    itemType: new TitleModel('Item type', 20),
    stage: StageModel.fromJson({ id: 30, title: 'Stage' }),
    subStage: StageModel.fromJson({ id: 40, title: 'Sub-stage' }),
  });
}
