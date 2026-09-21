import type measurementModel from '@/modules/shared/measurement/core/models/measurement.model';
import type { UnitTypeEnum } from '../constant/unit.type.enum';

import type BrandModel from '@/modules/shared/Brand/core/models/brand.model';
import type ItemTypesModel from '@/modules/MainOrganization/ItemTypes/core/models/item.types.model';
import type StageModel from '@/modules/shared/Stages/core/models/stage.model';
import LaborModel from '@/modules/MainOrganization/Labors/core/models/labor.model';

interface ApiRelation {
  id?: number;
  title?: unknown;
}

interface MaterialsShowResponse {
  id?: number;
  price?: number | string | null;
  title?: unknown;
  status?: boolean | number | string | null;
  brand?: ApiRelation;
  measurement_unit?: ApiRelation;
  item_type?: ApiRelation;
  stage?: ApiRelation;
  sub_stages?: ApiRelation[];
  unit?: UnitTypeEnum;
}

export default class MaterialsShowModel {
  public readonly id?: number;
  public readonly price?: number;
  public readonly title?: string;
  public readonly status: boolean;

  public readonly brand?: BrandModel;
  public readonly measurementId?: measurementModel;

  public readonly translations: {
    title: Record<string, string>;
  };

  public readonly unit?: UnitTypeEnum;

  public readonly itemType?: ItemTypesModel;
  public readonly stage?: StageModel;
  public readonly subStage?: StageModel;
  public readonly subStages: StageModel[];

  constructor(data: {
    id?: number;
    price?: number;
    title?: string;
    status?: boolean;

    brand?: BrandModel;
    measurementId?: measurementModel;

    translations: {
      title: Record<string, string>;
    };

    unit?: UnitTypeEnum;

    itemType?: ItemTypesModel;
    stage?: StageModel;
    subStage?: StageModel;
    subStages?: StageModel[];
  }) {
    this.id = data.id;
    this.price = data.price;
    this.title = data.title;
    this.status = data.status ?? false;

    this.brand = data.brand;
    this.measurementId = data.measurementId;

    this.translations = data.translations;

    this.unit = data.unit;

    this.itemType = data.itemType;
    this.stage = data.stage;
    this.subStages = data.subStages ?? [];
    this.subStage = data.subStage ?? this.subStages[0];

    Object.freeze(this);
  }

  static fromJson(json: MaterialsShowResponse): MaterialsShowModel {
    if (!json) {
      throw new Error('Invalid MaterialsShowModel data');
    }

    const translations = LaborModel.mapTranslations(json.title);

    const subStages = (json.sub_stages ?? []).map(
      (subStage) =>
        ({
          id: subStage.id,
          title: subStage.title,
        }) as StageModel,
    );

    return new MaterialsShowModel({
      id: json.id,

      price: json.price !== null && json.price !== undefined ? Number(json.price) : undefined,

      title: translations.en ?? translations.ar,
      status: json.status === true || Number(json.status) === 1,

      brand: json.brand
        ? ({
            id: json.brand.id,
            title: json.brand.title,
          } as BrandModel)
        : undefined,

      measurementId: json.measurement_unit
        ? ({
            id: json.measurement_unit.id,
            title: json.measurement_unit.title,
          } as measurementModel)
        : undefined,

      itemType: json.item_type
        ? ({
            id: json.item_type.id,
            title: json.item_type.title,
          } as ItemTypesModel)
        : undefined,

      stage: json.stage
        ? ({
            id: json.stage.id,
            title: json.stage.title,
          } as StageModel)
        : undefined,

      subStage: subStages[0],
      subStages,

      translations: {
        title: translations,
      },

      unit: json.unit as UnitTypeEnum | undefined,
    });
  }

  static example: MaterialsShowModel = new MaterialsShowModel({
    id: 36,

    price: 2,

    title: 'sssssssssssssssssss',
    status: true,

    brand: {
      id: 38,
      title: '50500',
    } as BrandModel,

    measurementId: {
      id: 165,
      title: 'كيلومتر مربع',
    } as measurementModel,

    itemType: {
      id: 21,
      title: 'Tenetur voluptatem a',
    } as ItemTypesModel,

    stage: {
      id: 129,
      title: 'منعم',
    } as StageModel,

    subStages: [
      {
        id: 150,
        title: 'sub stage2',
      } as StageModel,
    ],

    unit: undefined,

    translations: {
      title: {
        en: 'sssssssssssssssssss',
      },
    },
  });
}
