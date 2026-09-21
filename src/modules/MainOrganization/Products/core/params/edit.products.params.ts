import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';
import { hasTitleTranslation } from '@/base/Presentation/Utils/input_title';
import { translate } from '@/locales/i18n';
import type TranslationParams from '@/base/Core/Params/translationParams';

export default class EditProductsParams implements Params {
  public productsId?: number;
  public translations?: TranslationParams;
  public itemTypeId?: number;
  public measurementUnitId?: number;
  public expectedPrice?: number;
  public image?: string;
  public stageIds?: number[];
  public sortings?: { title: string; price: number }[];
  public isActive?: boolean;

  public static readonly validation = new ClassValidation().setRules({
    translations: {
      required: true,
      custom: (value) => hasTitleTranslation(value) || translate('validation.title_required'),
    },

    itemTypeId: {
      required: true,
    },

    measurementUnitId: {
      required: true,
    },

    expectedPrice: {
      required: true,
    },

    stageIds: {
      required: true,
    },
  });

  constructor(data: {
    productsId?: number;
    translations?: TranslationParams;
    itemTypeId?: number;
    measurementUnitId?: number;
    expectedPrice?: number;
    image?: string;
    stageIds?: number[];
    sortings?: { title: string; price: number }[];
    isActive?: boolean;
  }) {
    this.productsId = data.productsId;
    this.translations = data.translations;
    this.itemTypeId = data.itemTypeId;
    this.measurementUnitId = data.measurementUnitId;
    this.expectedPrice = data.expectedPrice;
    this.image = data.image;
    this.stageIds = data.stageIds;
    this.sortings = data.sortings;
    this.isActive = data.isActive;
  }

  toMap(): Record<string, unknown> {
    const map: Record<string, unknown> = {
      product_id: this.productsId,
      translations: this.translations?.toMap(),
    };

    if (this.itemTypeId != null) map.item_type_id = this.itemTypeId;
    if (this.measurementUnitId != null) map.measurement_unit_id = this.measurementUnitId;
    if (this.expectedPrice != null) map.expected_price = this.expectedPrice;
    if (this.image) map.image = this.image;
    if (this.stageIds?.length) map.stage_ids = this.stageIds;
    if (this.sortings !== undefined) map.sortings = this.sortings;
    if (this.isActive !== undefined) map.status = this.isActive;

    return map;
  }

  validate() {
    return EditProductsParams.validation.validate(this);
  }

  validateOrThrow() {
    return EditProductsParams.validation.validateOrThrow(this);
  }
}
