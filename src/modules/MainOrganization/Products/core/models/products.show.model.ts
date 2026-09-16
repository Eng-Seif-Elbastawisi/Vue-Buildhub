import TranslationParams from '@/base/Core/Params/translationParams';

interface ApiTranslationItem {
  locale: string;
  title?: string;
  description?: string;
}

interface ApiRelation {
  id: number;
  title?: string | ApiTranslationItem[];
}

interface ApiStage {
  id: number;
  parent_id: number | null;
  title: ApiTranslationItem[] | string;
}

interface ApiAttachment {
  id: number;
  file: string;
  type: number;
}

interface ApiSorting {
  id: number;
  title: string;
  price: string | number;
}

export interface ProductShowStage {
  id: number;
  title: string;
}

export interface ProductShowSorting {
  id?: number;
  title: string;
  price: number;
}

export default class ProductsShowModel {
  public readonly id?: number;

  public readonly translations?: TranslationParams;

  public readonly itemTypeId?: number;
  public readonly itemTypeTitle?: string;

  public readonly measurementUnitId?: number;
  public readonly measurementUnitTitle?: string;

  public readonly expectedPrice?: number;
  public readonly isActive?: boolean;

  // مهم للـ Edit
  public readonly stageIds: number[];

  // مهم للـ Show
  public readonly stages: ProductShowStage[];

  public readonly sortings: ProductShowSorting[];

  public readonly image?: string;

  constructor(data: {
    id?: number;

    translations?: TranslationParams;

    itemTypeId?: number;
    itemTypeTitle?: string;

    measurementUnitId?: number;
    measurementUnitTitle?: string;

    expectedPrice?: number;
    isActive?: boolean;

    stageIds?: number[];

    stages?: ProductShowStage[];

    sortings?: ProductShowSorting[];

    image?: string;
  }) {
    this.id = data.id;

    this.translations = data.translations;

    this.itemTypeId = data.itemTypeId;
    this.itemTypeTitle = data.itemTypeTitle;

    this.measurementUnitId = data.measurementUnitId;
    this.measurementUnitTitle = data.measurementUnitTitle;

    this.expectedPrice = data.expectedPrice;
    this.isActive = data.isActive;

    // للـ Edit
    this.stageIds = data.stageIds ?? [];

    // للـ Show
    this.stages = data.stages ?? [];

    this.sortings = data.sortings ?? [];

    this.image = data.image;

    Object.freeze(this);
  }

  private static mapLocaleArray(
    arr: ApiTranslationItem[] | undefined,
    key: 'title' | 'description',
  ): Record<string, string> {
    if (!Array.isArray(arr)) return {};

    return arr.reduce<Record<string, string>>((acc, item) => {
      const value = item[key];

      if (item.locale && value) {
        acc[item.locale] = value;
      }

      return acc;
    }, {});
  }

  private static extractTitle(
    relation: ApiRelation | ApiTranslationItem[] | string | undefined,
  ): string | undefined {
    if (!relation) return undefined;

    if (typeof relation === 'string') {
      return relation;
    }

    if (Array.isArray(relation)) {
      const ar = relation.find((item) => item.locale === 'ar')?.title;

      const en = relation.find((item) => item.locale === 'en')?.title;

      return ar || en || relation[0]?.title;
    }

    if (Array.isArray(relation.title)) {
      const ar = relation.title.find((item) => item.locale === 'ar')?.title;

      const en = relation.title.find((item) => item.locale === 'en')?.title;

      return ar || en || relation.title[0]?.title;
    }

    return relation.title;
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

    const itemTypeId = data.item_type?.id ?? data.itemTypeId;

    const itemTypeTitle = ProductsShowModel.extractTitle(data.item_type?.title);

    // =====================================================
    // Measurement
    // =====================================================

    const measurementUnitId = data.measurement_unit?.id ?? data.measurementUnitId;

    const measurementUnitTitle = ProductsShowModel.extractTitle(data.measurement_unit?.title);

    // =====================================================
    // Expected Price
    // =====================================================

    const expectedPrice =
      data.expected_price != null ? Number(data.expected_price) : data.expectedPrice;

    // =====================================================
    // Stages
    // =====================================================

    const stages: ProductShowStage[] = Array.isArray(data.stages)
      ? data.stages.map((stage: ApiStage) => ({
          id: stage.id,

          title: ProductsShowModel.extractTitle(stage.title) ?? `Stage ${stage.id}`,
        }))
      : [];

    // مهم جداً للـ Edit
    const stageIds: number[] =
      stages.length > 0
        ? stages.map((stage) => stage.id)
        : Array.isArray(data.stageIds)
          ? data.stageIds
          : [];

    // =====================================================
    // Sortings
    // =====================================================

    const sortings: ProductShowSorting[] = Array.isArray(data.sortings)
      ? data.sortings.map((sorting: ApiSorting) => ({
          id: sorting.id,

          title: sorting.title,

          price: Number(sorting.price ?? 0),
        }))
      : [];

    // =====================================================
    // Image
    // =====================================================

    const firstAttachment = Array.isArray(data.attachments)
      ? data.attachments.find((attachment: ApiAttachment) => attachment.type === 1)
      : undefined;

    const image = firstAttachment?.file ?? data.image;

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

      itemTypeId,
      itemTypeTitle,

      measurementUnitId,
      measurementUnitTitle,

      expectedPrice,

      isActive,

      stageIds,

  
      stages,

      sortings,

      image,
    });
  }
}
