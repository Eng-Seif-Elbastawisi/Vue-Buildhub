import TitleModel from '@/base/Core/Models/titleModel';
import { UnitTypeEnum } from '@/modules/shared/Materials/core/constant/unit.type.enum';
import StageModel from '@/modules/shared/Stages/core/models/stage.model';

export type LaborPricingMode = 'configured' | 'manual_entry';

export default class LaborModel {
  public readonly id?: number;
  public readonly price: number;
  public readonly title: string;
  public readonly unit: UnitTypeEnum;
  public readonly translations: { title: Record<string, string> };
  public readonly status: boolean;
  public readonly itemType?: TitleModel;
  public readonly measurementUnit?: TitleModel;
  public readonly stage?: StageModel;
  public readonly subStage?: StageModel;
  public readonly pricingMode: LaborPricingMode;
  public readonly activeMappingCount: number;
  public readonly mappingReady: boolean;

  constructor(labor: {
    id?: number;
    translations: { title: Record<string, string> };
    unit: UnitTypeEnum;
    title: string;
    price: number;
    status?: boolean;
    itemType?: TitleModel;
    measurementUnit?: TitleModel;
    stage?: StageModel;
    subStage?: StageModel;
    pricingMode?: LaborPricingMode;
    activeMappingCount?: number;
    mappingReady?: boolean;
  }) {
    this.id = labor.id;
    this.translations = labor.translations;
    this.unit = labor.unit;
    this.price = labor.price;
    this.title = labor.title;
    this.status = labor.status ?? false;
    this.itemType = labor.itemType;
    this.measurementUnit = labor.measurementUnit;
    this.stage = labor.stage;
    this.subStage = labor.subStage;
    this.pricingMode = labor.pricingMode ?? 'manual_entry';
    this.activeMappingCount = labor.activeMappingCount ?? 0;
    this.mappingReady = labor.mappingReady ?? false;
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

    const activeMappingCount = LaborModel.mapActiveMappingCount(
      json.activeMappingCount ?? json.active_mapping_count,
    );

    return new LaborModel({
      id: json.id as number | undefined,
      translations: { title: LaborModel.mapTranslations(json.translations) },
      unit: json.unit as UnitTypeEnum,
      title: json.title as string,
      price: Number(json.price),
      status: json.status === true || Number(json.status) === 1,
      itemType: LaborModel.mapTitleRelation(json.itemType ?? json.item_type),
      measurementUnit: LaborModel.mapTitleRelation(json.measurementUnit ?? json.measurement_unit),
      stage: LaborModel.mapStageRelation(json.stage),
      subStage: LaborModel.mapStageRelation(json.subStage ?? json.sub_stage),
      pricingMode: LaborModel.mapPricingMode(
        json.pricingMode ?? json.defaultPricingMode ?? json.default_pricing_mode,
      ),
      activeMappingCount,
      mappingReady: LaborModel.mapReadiness(
        json.mappingReady ?? json.mapping_readiness,
        activeMappingCount,
      ),
    });
  }

  private static mapPricingMode(rawPricingMode: unknown): LaborPricingMode {
    return rawPricingMode === 'configured' ? 'configured' : 'manual_entry';
  }

  private static mapActiveMappingCount(rawMappingCount: unknown): number {
    const mappingCount = Number(rawMappingCount ?? 0);
    return Number.isFinite(mappingCount) && mappingCount > 0 ? Math.trunc(mappingCount) : 0;
  }

  private static mapReadiness(rawReadiness: unknown, activeMappingCount: number): boolean {
    if (rawReadiness === undefined || rawReadiness === null) return activeMappingCount > 0;
    return (
      rawReadiness === true ||
      rawReadiness === 1 ||
      rawReadiness === '1' ||
      rawReadiness === 'ready'
    );
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
    measurementUnit: new TitleModel('Meter', 1),
    stage: StageModel.fromJson({ id: 30, title: 'Stage' }),
    subStage: StageModel.fromJson({ id: 40, title: 'Sub-stage' }),
    pricingMode: 'configured',
    activeMappingCount: 2,
    mappingReady: true,
  });
}
