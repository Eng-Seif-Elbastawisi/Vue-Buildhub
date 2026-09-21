import ItemTypesModel from '@/modules/MainOrganization/ItemTypes/core/models/item.types.model';
import { UnitTypeEnum } from '@/modules/shared/Materials/core/constant/unit.type.enum';
import MeasurementModel from '@/modules/shared/measurement/core/models/measurement.model';
import StageModel from '@/modules/shared/Stages/core/models/stage.model';

export type LaborPricingMode = 'configured' | 'manual_entry';

export default class LaborModel {
  public readonly id?: number;
  public readonly price: number;
  public readonly title: string;
  public readonly unit: UnitTypeEnum;
  public readonly translations: { title: Record<string, string> };
  public readonly status: boolean;
  public readonly itemType?: ItemTypesModel;
  public readonly measurementUnit?: MeasurementModel;
  public readonly stage?: StageModel;
  public readonly subStage?: StageModel;
  public readonly subStages: StageModel[];
  public readonly pricingMode: LaborPricingMode;
  public readonly activeMappingCount: number;
  public readonly mappingReady: boolean;
  public readonly code?: string;

  constructor(labor: {
    id?: number;
    translations: { title: Record<string, string> };
    unit: UnitTypeEnum;
    title: string;
    price: number;
    status?: boolean;
    itemType?: ItemTypesModel;
    measurementUnit?: MeasurementModel;
    stage?: StageModel;
    subStage?: StageModel;
    subStages?: StageModel[];
    pricingMode?: LaborPricingMode;
    activeMappingCount?: number;
    mappingReady?: boolean;
    code?: string;
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
    this.subStages = labor.subStages ?? [];
    this.subStage = labor.subStage ?? this.subStages[0];
    this.pricingMode = labor.pricingMode ?? 'manual_entry';
    this.activeMappingCount = labor.activeMappingCount ?? 0;
    this.mappingReady = labor.mappingReady ?? false;
    this.code = labor.code;

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

    const subStages = ((json.sub_stages as Record<string, unknown>[] | undefined) ?? []).map(
      (relation) => StageModel.fromJson(relation),
    );

    return new LaborModel({
      id: json.id as number | undefined,
      translations: { title: LaborModel.mapTranslations(json.translations) },
      unit: json.unit as UnitTypeEnum,
      title: json.title as string,
      price: Number(json.price),
      status: json.status === true || Number(json.status) === 1,
      itemType: ItemTypesModel.fromJson(json.item_type ?? {}),
      measurementUnit: MeasurementModel.fromJson(json.measurement_unit ?? {}),
      stage: StageModel.fromJson(json.stage ?? {}),
      subStage: subStages[0],
      subStages,
      pricingMode: LaborModel.mapPricingMode(
        json.pricingMode ?? json.defaultPricingMode ?? json.default_pricing_mode,
      ),
      activeMappingCount,
      mappingReady: LaborModel.mapReadiness(
        json.mappingReady ?? json.mapping_readiness,
        activeMappingCount,
      ),
      code: json.code as string | undefined,
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

  static example: LaborModel = new LaborModel({
    id: 10,
    translations: { title: { ar: 'مصنعية', en: 'Labor' } },
    unit: UnitTypeEnum.meter,
    title: 'Labor',
    price: 100,
    status: true,
    itemType: ItemTypesModel.example,
    measurementUnit: MeasurementModel.example,
    stage: StageModel.example,
    subStages: [StageModel.example],
    pricingMode: 'configured',
    activeMappingCount: 2,
    mappingReady: true,
  });
}
