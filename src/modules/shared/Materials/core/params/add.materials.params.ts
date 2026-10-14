import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';
import { hasTitleTranslation, requiredSelectRule } from '@/base/Presentation/Utils/input_title';
import { translate } from '@/locales/i18n';

export default class AddMaterialsParams implements Params {
  public price?: number;
  public quantity?: number;
  public brandId?: number;
  public measurementId?: number;
  public translations?: { title: Record<string, string> };
  public itemTypeId?: number;
  public stageId?: number;
  public subStageIds?: number[];
  public status?: boolean;
  public static readonly validation = new ClassValidation().setRules({
    price: { required: true },
    brandId: requiredSelectRule(),
    measurementId: requiredSelectRule(),
    translations: {
      required: true,
      custom: (value) => hasTitleTranslation(value) || translate('validation.title_required'),
    },
    itemTypeId: requiredSelectRule(),
  });
  constructor(data: {
    price?: number;
    quantity?: number;
    brandId?: number;
    measurementId?: number;
    translations?: { title: Record<string, string> };
    itemTypeId?: number;
    stageId?: number;
    subStageIds?: number[];
    status?: boolean;
  }) {
    this.price = data.price;
    this.quantity = data.quantity;
    this.brandId = data.brandId;
    this.measurementId = data.measurementId;
    this.translations = data.translations;
    this.itemTypeId = data.itemTypeId;
    this.stageId = data.stageId;
    this.subStageIds = data.subStageIds;
    this.status = data.status;
  }
  toMap(): Record<string, unknown> {
    return {
      price: this.price,
      quantity: this.quantity,
      brand_id: this.brandId,
      measurement_unit_id: this.measurementId,
      translations: this.translations,
      item_type_id: this.itemTypeId,
      stage_id: this.stageId,
      sub_stage_ids: this.subStageIds,
      status: this.status,
    };
  }
  validate() {
    return AddMaterialsParams.validation.validate(this);
  }
  validateOrThrow() {
    return AddMaterialsParams.validation.validateOrThrow(this);
  }
}
