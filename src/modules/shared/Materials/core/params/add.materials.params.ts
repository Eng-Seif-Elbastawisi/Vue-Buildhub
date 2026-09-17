import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';
import { hasTitleTranslation, requiredSelectRule } from '@/base/Presentation/Utils/input_title';
import { translate } from '@/locales/i18n';

export default class AddMaterialsParams implements Params {
  public price?: number;
  public brandId?: number;
  public measurementId?: number;
  public translations?: { title: Record<string, string> };
  public itemTypeId?: number;
  public stageId?: number;
  public subStageId?: number;
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
    brandId?: number;
    measurementId?: number;
    translations?: { title: Record<string, string> };
    itemTypeId?: number;
    stageId?: number;
    subStageId?: number;
  }) {
    this.price = data.price;
    this.brandId = data.brandId;
    this.measurementId = data.measurementId;
    this.translations = data.translations;
    this.itemTypeId = data.itemTypeId;
    this.stageId = data.stageId;
    this.subStageId = data.subStageId;
  }
  toMap(): { [p: string]: any } {
    return {
      price: this.price,
      brand_id: this.brandId,
      measurement_unit_id: this.measurementId,
      translations: this.translations,
      item_type_id: this.itemTypeId,
      stage_id: this.stageId,
      sub_stage_id: this.subStageId,
    };
  }
  validate() {
    return AddMaterialsParams.validation.validate(this);
  }
  validateOrThrow() {
    return AddMaterialsParams.validation.validateOrThrow(this);
  }
}
