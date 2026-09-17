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
    this.title = data.title;
    this.description = data.description;

    Object.freeze(this);
  }

  private static mapLocaleArray(
    arr: ApiTranslationItem[] | undefined,
    key: 'title' | 'description',
  ): Record<string, string> {
    if (!Array.isArray(arr)) {
      return {};
    }

    return arr.reduce<Record<string, string>>((acc, item) => {
      const value = item[key];

      if (item.locale && value) {
        acc[item.locale] = value;
      }

      return acc;
    }, {});
  }

  static fromJson(json: any): ProductsShowModel {
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
      ? data.stages.map((stage: any) => StageModel.fromJson(stage))
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
      ? data.sortings.map((sorting: any) => ProductShowSortingModel.fromJson(sorting))
      : [];

    // =====================================================
    // Attachments
    // =====================================================

    const attachments: AttachmentModel[] = Array.isArray(data.attachments)
      ? data.attachments.map((attachment: any) => AttachmentModel.fromJson(attachment))
      : [];

    const firstAttachment = attachments[0];

    const image = firstAttachment?.file ?? data.image ?? '';

    // =====================================================
    // Active
    // =====================================================

    const isActive = data.is_active != null ? Boolean(data.is_active) : (data.isActive ?? true);

    // =====================================================
    // Return
    // =====================================================

    return new ProductsShowModel({
      id: data.id,

      translations: new TranslationParams({
        title: titleMap,
        description: descriptionMap,
      }),
      title: data.title,
      description: data.description,

      itemType,

      measurementUnit,

      expectedPrice,

      isActive,

      stageIds,

      stages,

      sortings,

      image,
    });
  }
}
