import TranslationParams from '@/base/Core/Params/translationParams';

import ItemTypesModel from '@/modules/MainOrganization/ItemTypes/core/models/item.types.show.model';
import AttachmentModel from './attachment.model';
import MeasurementModel from '@/modules/shared/measurement/core/models/measurement.model';
import StageModel from '@/modules/shared/Stages/core/models/stage.model';

import ProductShowSortingModel from './ProductShowSortingModel';

interface ApiTranslationItem {
  locale: string;
  title?: string;
  description?: string;
}

interface ApiProductsShowResponse {
  data?: ApiProductsShowResponse;
  id?: number;
  title?: ApiTranslationItem[] | string;
  description?: ApiTranslationItem[] | string;
  item_type?: Record<string, unknown>;
  measurement_unit?: Record<string, unknown>;
  expected_price?: number | string | null;
  expectedPrice?: number;
  stages?: Record<string, unknown>[];
  stageIds?: number[];
  sortings?: Record<string, unknown>[];
  attachments?: Record<string, unknown>[];
  image?: string;
  code?: string;
  is_active?: boolean | number | string | null;
  isActive?: boolean;
}

export default class ProductsShowModel {
  public readonly id?: number;

  public readonly translations?: TranslationParams;

  public title?: string;
  public description?: string;

  public readonly itemType?: ItemTypesModel;

  public readonly measurementUnit?: MeasurementModel;

  public readonly expectedPrice?: number;

  public readonly isActive?: boolean;

  public readonly stageIds: number[];

  public readonly stages: StageModel[];

  public readonly sortings: ProductShowSortingModel[];

  public readonly image?: string;

  public readonly code?: string;

  public readonly attachments: AttachmentModel[];

  constructor(data: {
    id?: number;

    translations?: TranslationParams;

    itemType?: ItemTypesModel;

    measurementUnit?: MeasurementModel;

    expectedPrice?: number;

    isActive?: boolean;

    stageIds?: number[];

    stages?: StageModel[];

    sortings?: ProductShowSortingModel[];

    image?: string;
    code?: string;
    attachments?: AttachmentModel[];
    title?: string;
    description?: string;
  }) {
    this.id = data.id;

    this.translations = data.translations;

    this.itemType = data.itemType;

    this.measurementUnit = data.measurementUnit;

    this.expectedPrice = data.expectedPrice;

    this.isActive = data.isActive;

    this.stageIds = data.stageIds ?? [];

    this.stages = data.stages ?? [];

    this.sortings = data.sortings ?? [];

    this.image = data.image;
    this.code = data.code;
    this.attachments = data.attachments ?? [];
    this.title = data.title;
    this.description = data.description;

    Object.freeze(this);
  }

  private static mapLocaleArray(
    translations: unknown,
    key: 'title' | 'description',
  ): Record<string, string> {
    if (!Array.isArray(translations)) {
      return {};
    }

    return (translations as ApiTranslationItem[]).reduce<Record<string, string>>((acc, item) => {
      const value = item[key];

      if (item.locale && value) {
        acc[item.locale] = value;
      }

      return acc;
    }, {});
  }

  static fromJson(json: ApiProductsShowResponse): ProductsShowModel {
    if (!json) {
      throw new Error('Cannot create ProductsShowModel from null or undefined');
    }

    const data = json.data ?? json;

    // =====================================================
    // Translations
    // =====================================================

    const titleMap = ProductsShowModel.mapLocaleArray(data.title, 'title');

    const descriptionMap = ProductsShowModel.mapLocaleArray(data.description, 'description');

    // =====================================================
    // Item Type
    // =====================================================

    const itemType = data.item_type ? ItemTypesModel.fromJson(data.item_type) : undefined;

    // =====================================================
    // Measurement
    // =====================================================

    const measurementUnit = data.measurement_unit
      ? MeasurementModel.fromJson(data.measurement_unit)
      : undefined;

    // =====================================================
    // Expected Price
    // =====================================================

    const expectedPrice =
      data.expected_price != null ? Number(data.expected_price) : data.expectedPrice;

    // =====================================================
    // Stages
    // =====================================================

    const stages: StageModel[] = Array.isArray(data.stages)
      ? data.stages.map((stage) => StageModel.fromJson(stage))
      : [];

    const stageIds: number[] =
      stages.length > 0
        ? stages.map((stage) => stage.id).filter((id): id is number => id !== undefined)
        : Array.isArray(data.stageIds)
          ? data.stageIds
          : [];

    // =====================================================
    // Sortings
    // =====================================================

    const sortings: ProductShowSortingModel[] = Array.isArray(data.sortings)
      ? data.sortings.map((sorting) => ProductShowSortingModel.fromJson(sorting))
      : [];

    // =====================================================
    // Attachments
    // =====================================================

    const attachments: AttachmentModel[] = Array.isArray(data.attachments)
      ? data.attachments.map((attachment) => AttachmentModel.fromJson(attachment))
      : [];

    const imageAttachment = attachments.find((attachment) => attachment.type === 1);

    const image = imageAttachment?.file ?? data.image ?? '';

    // =====================================================
    // Active
    // =====================================================

    const isActive =
      data.is_active != null
        ? data.is_active === true || Number(data.is_active) === 1
        : (data.isActive ?? true);

    // =====================================================
    // Return
    // =====================================================

    return new ProductsShowModel({
      id: data.id,

      translations: new TranslationParams({
        title: titleMap,
        description: descriptionMap,
      }),
      title: typeof data.title === 'string' ? data.title : (titleMap.en ?? titleMap.ar),
      description:
        typeof data.description === 'string'
          ? data.description
          : (descriptionMap.en ?? descriptionMap.ar),

      itemType,

      measurementUnit,

      expectedPrice,

      isActive,

      stageIds,

      stages,

      sortings,

      image,
      code: data.code,
      attachments,
    });
  }
}
