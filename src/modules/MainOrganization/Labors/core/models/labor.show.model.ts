import measurementModel from '@/modules/shared/measurement/core/models/measurement.model';

import BrandModel from '@/modules/shared/Brand/core/models/brand.model';
import ItemTypesModel from '@/modules/MainOrganization/ItemTypes/core/models/item.types.model';
import StageModel from '@/modules/shared/Stages/core/models/stage.model';
import type { UnitTypeEnum } from '@/modules/shared/Materials/core/constant/unit.type.enum';
import LaborModel from './labor.model';

interface ApiRelation {
  id?: number;
  title?: unknown;
}

interface LaborShowResponse {
  id?: number;
  price?: number | string | null;
  title?: unknown;
  status?: boolean | number | string | null;
  brand?: ApiRelation;
  measurement_unit?: ApiRelation;
  item_type?: ApiRelation;
  stage?: ApiRelation;
  sub_stage?: ApiRelation;
  unit?: UnitTypeEnum;
}

export default class laborShowModel {
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
    this.subStage = data.subStage;

    Object.freeze(this);
  }

  static fromJson(json: LaborShowResponse): laborShowModel {
    if (!json) {
      throw new Error('Invalid laborShowModel data');
    }

    const translations = LaborModel.mapTranslations(json.title);

    return new laborShowModel({
      id: json.id,

      price: json.price !== null && json.price !== undefined ? Number(json.price) : undefined,

      title: translations.en ?? translations.ar,
      status: json.status === true || Number(json.status) === 1,

      brand: json.brand ? BrandModel.fromJson(json.brand) : undefined,

      measurementId: json.measurement_unit
        ? measurementModel.fromJson(json.measurement_unit)
        : undefined,

      itemType: json.item_type
        ? ItemTypesModel.fromJson(json.item_type as any)
        : undefined,

      stage: json.stage ? StageModel.fromJson(json.stage) : undefined,

      subStage: json.sub_stage
        ? ({
          id: json.sub_stage.id,
          title: json.sub_stage.title,
        } as StageModel)
        : undefined,

      translations: {
        title: translations,
      },

      unit: json.unit as UnitTypeEnum | undefined,
    });
  }

  static example: laborShowModel = new laborShowModel({
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

    subStage: {
      id: 150,
      title: 'sub stage2',
    } as StageModel,

    unit: undefined,

    translations: {
      title: {
        en: 'sssssssssssssssssss',
      },
    },
  });
}
