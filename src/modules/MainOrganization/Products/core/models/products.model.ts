import TranslationParams from '@/base/Core/Params/translationParams';

interface ApiRelation {
  id: number;
  title?: string;
}

interface ApiStage {
  id: number;
}

interface ApiSorting {
  id: number;
  title: string;
  price: string | number;
}

interface ApiAttachment {
  file: string;
  type: number;
}

export interface ProductSorting {
  id?: number;
  title: string;
  price: number;
}

export default class ProductsModel {
  public readonly id?: number;
  public readonly title?: string;
  public readonly translations?: TranslationParams;

  public readonly itemTypeId?: number;
  public readonly itemTypeTitle?: string;

  public readonly measurementUnitId?: number;
  public readonly measurementUnitTitle?: string;

  public readonly expectedPrice?: number;
  public readonly isActive?: boolean;

  public readonly stageIds: number[];
  public readonly sortings: ProductSorting[];

  public readonly image?: string;
  public readonly status: boolean;

  constructor(data: {
    id?: number;
    title?: string;
    translations?: TranslationParams;
    itemTypeId?: number;
    itemTypeTitle?: string;
    measurementUnitId?: number;
    measurementUnitTitle?: string;
    expectedPrice?: number;
    isActive?: boolean;
    stageIds?: number[];
    sortings?: ProductSorting[];
    image?: string;
    status?: boolean;
  }) {
    this.id = data.id;
    this.title = data.title;
    this.translations = data.translations;

    this.itemTypeId = data.itemTypeId;
    this.itemTypeTitle = data.itemTypeTitle;

    this.measurementUnitId = data.measurementUnitId;
    this.measurementUnitTitle = data.measurementUnitTitle;

    this.expectedPrice = data.expectedPrice;
    this.isActive = data.isActive;

    this.stageIds = data.stageIds ?? [];
    this.sortings = data.sortings ?? [];

    this.image = data.image;
    this.status = data.status ?? false;

    Object.freeze(this);
  }

  static mapTranslations(translations: unknown, key: string = 'title'): Record<string, string> {
    if (!translations) return {};

    if (!Array.isArray(translations)) {
      const value = translations as {
        title?: Record<string, string>;
      };

      return value?.title ?? {};
    }

    return translations.reduce<Record<string, string>>((result, translation) => {
      const item = translation as Record<string, string>;

      if (item.locale && item[key]) {
        result[item.locale] = item[key];
      }

      return result;
    }, {});
  }

  private static extractTitle(relation: ApiRelation | string | undefined): string | undefined {
    if (!relation) return undefined;

    return typeof relation === 'string' ? relation : relation.title;
  }

  private static mapSortings(sortings: unknown): ProductSorting[] {
    if (!Array.isArray(sortings)) return [];

    return sortings.map((sorting: ApiSorting) => ({
      id: sorting.id,
      title: sorting.title,
      price: Number(sorting.price ?? 0),
    }));
  }

  private static mapStageIds(stages: unknown): number[] {
    if (!Array.isArray(stages)) return [];

    return stages.map((stage: ApiStage) => stage.id).filter((id) => id != null);
  }

  private static extractImage(attachments: unknown): string | undefined {
    if (!Array.isArray(attachments)) return undefined;

    return attachments.find((attachment: ApiAttachment) => attachment.type === 1)?.file;
  }

  static fromJson(json: Record<string, unknown>): ProductsModel {
    if (!json) {
      throw new Error('Cannot create ProductsModel from null or undefined');
    }

    const data = (json.data as Record<string, unknown>) ?? json;

    const titleTranslations = Array.isArray(data.title)
      ? ProductsModel.mapTranslations(data.title)
      : {};

    const descriptionTranslations = Array.isArray(data.description)
      ? ProductsModel.mapTranslations(data.description, 'description')
      : {};

    const title =
      typeof data.title === 'string' ? data.title : (titleTranslations.ar ?? titleTranslations.en);

    const itemType = data.item_type as ApiRelation | undefined;
    const measurementUnit = data.measurement_unit as ApiRelation | undefined;

    return new ProductsModel({
      id: data.id as number | undefined,

      title,

      translations: new TranslationParams({
        title: titleTranslations,
        description: descriptionTranslations,
      }),

      itemTypeId: itemType?.id,
      itemTypeTitle: ProductsModel.extractTitle(itemType),

      measurementUnitId: measurementUnit?.id,
      measurementUnitTitle: ProductsModel.extractTitle(measurementUnit),

      expectedPrice: data.expected_price != null ? Number(data.expected_price) : undefined,

      isActive:
        data.is_active != null ? data.is_active === true || Number(data.is_active) === 1 : true,

      stageIds: ProductsModel.mapStageIds(data.stages),

      sortings: ProductsModel.mapSortings(data.sortings),

      image: ProductsModel.extractImage(data.attachments),

      status: data.status === true || Number(data.status) === 1,
    });
  }

  static fromList(json: Record<string, unknown>): ProductsModel[] {
    const list = (json.data as Record<string, unknown[]>)?.data ?? json.data;

    if (!Array.isArray(list)) return [];

    return list.map((item) => ProductsModel.fromJson(item as Record<string, unknown>));
  }

  static example = new ProductsModel({
    id: 1,
    title: 'Commercial project',

    translations: new TranslationParams({
      title: {
        ar: 'مشروع تجاري',
        en: 'Commercial project',
      },
      description: {
        ar: 'وصف',
        en: 'Description',
      },
    }),

    itemTypeId: 17,
    itemTypeTitle: 'Non consectetur vero',

    measurementUnitId: 164,
    measurementUnitTitle: 'كيلو ميتر',

    expectedPrice: 833333333333,
    isActive: true,

    stageIds: [98, 96, 95, 93, 92],

    sortings: [
      {
        id: 1,
        title: 'فرز 1',
        price: 60,
      },
      {
        id: 2,
        title: 'فرز 2',
        price: 66,
      },
    ],

    image: 'https://api.buildhub.techlabeg.com/attachments/products/kmaJO3zRlb_1789545286.png',
  });
}
