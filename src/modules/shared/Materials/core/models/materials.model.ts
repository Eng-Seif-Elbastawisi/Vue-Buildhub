import ItemTypesModel from '@/modules/MainOrganization/ItemTypes/core/models/item.types.model';
import MeasurementModel from '@/modules/shared/measurement/core/models/measurement.model';
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
  public readonly measurementUnit?: MeasurementModel;
  public readonly stage?: StageModel;
  public readonly subStage?: StageModel;
  public readonly subStages: StageModel[];
  public readonly code?: string;

  constructor(data: {
    id?: number;
    translations: { title: Record<string, string> };
    unit: UnitTypeEnum;
    title: string;
    price: number;
    brandId?: number;
    itemType?: ItemTypesModel;
    measurementUnit?: MeasurementModel;
    stage?: StageModel;
    subStage?: StageModel;
    subStages?: StageModel[];
    status?: boolean;
    code?: string;
  }) {
    this.id = data.id;
    this.translations = data.translations;
    this.unit = data.unit;
    this.price = data.price;
    this.brandId = data.brandId;
    this.title = data.title;
    this.itemType = data.itemType;
    this.measurementUnit = data.measurementUnit;
    this.stage = data.stage;
    this.subStages = data.subStages ?? [];
    this.subStage = data.subStage ?? this.subStages[0];
    this.status = data.status ?? false;
    this.code = data.code;

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

  static fromJson(json: any): MaterialsModel {
    if (!json) throw new Error('Cannot create MaterialsModel from null or undefined');

    const subStages = (json.sub_stages ?? []).map((relation: Record<string, unknown>) =>
      StageModel.fromJson(relation),
    );

    return new MaterialsModel({
      id: json.id as number | undefined,
      translations: { title: MaterialsModel.mapTranslations(json.translations) },
      unit: json.unit as UnitTypeEnum,
      title: json.title as string,
      price: Number(json.price),
      brandId: (json.brandId ?? json.brand_id) as number | undefined,
      itemType: ItemTypesModel.fromJson(json.item_type ?? {}),
      measurementUnit: json.measurement_unit
        ? MeasurementModel.fromJson(json.measurement_unit)
        : undefined,
      stage: StageModel.fromJson(json.stage ?? {}),
      subStage: subStages[0],
      subStages,
      status: json.status === true || Number(json.status) === 1,
      code: json.code as string | undefined,
    });
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
    measurementUnit: MeasurementModel.example,
    stage: StageModel.example,
    subStages: [StageModel.example],
    code: '100',
  });
}
