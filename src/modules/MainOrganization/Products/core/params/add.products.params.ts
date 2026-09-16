import type Params from '@/base/Core/Params/params';

import { ClassValidation } from '@/base/Presentation/Utils/classValidation';

import { hasTitleTranslation } from '@/base/Presentation/Utils/input_title';

import { translate } from '@/locales/i18n';

import type TranslationParams from '@/base/Core/Params/translationParams';

export default class AddProductsParams implements Params {
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
    translations: {
      required: true,
      custom: (value) => hasTitleTranslation(value) || translate('validation.title_required'),
    },
  });

  constructor(data: {
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
    return AddProductsParams.validation.validate(this);
  }

  validateOrThrow() {
    return AddProductsParams.validation.validateOrThrow(this);
  }
}
