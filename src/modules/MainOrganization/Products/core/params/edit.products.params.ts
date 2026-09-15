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

  public sortings?: {
    title: string;
    price: number;
  }[];

  public static readonly validation = new ClassValidation().setRules({
    productsId: {
      required: true,
    },

    translations: {
      required: true,
      custom: (value) => hasTitleTranslation(value) || translate('validation.title_required'),
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

    sortings?: {
      title: string;
      price: number;
    }[];
  }) {
    this.productsId = data.productsId;
    this.translations = data.translations;
    this.itemTypeId = data.itemTypeId;
    this.measurementUnitId = data.measurementUnitId;
    this.expectedPrice = data.expectedPrice;
    this.image = data.image;
    this.stageIds = data.stageIds;
    this.sortings = data.sortings;
  }

  toMap(): Record<string, unknown> {
    return {
      products_id: this.productsId,
      translations: this.translations?.toMap(),
      item_type_id: this.itemTypeId,
      measurement_unit_id: this.measurementUnitId,
      expected_price: this.expectedPrice,
      image: this.image,
      stage_ids: this.stageIds,
      sortings: this.sortings,
    };
  }

  validate() {
    return EditProductsParams.validation.validate(this);
  }

  validateOrThrow() {
    return EditProductsParams.validation.validateOrThrow(this);
  }
}
