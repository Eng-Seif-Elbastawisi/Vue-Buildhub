import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';
import { hasTitleTranslation, requiredSelectRule } from '@/base/Presentation/Utils/input_title';
import { translate } from '@/locales/i18n';

export default class AddLaborParams implements Params {
  public price?: number;
  public measurementId?: number;
  public translations?: { title: Record<string, string> };
  public itemTypeId?: number;
  public stageId?: number;
  public subStageId?: number;
  public status?: boolean;
  public static readonly validation = new ClassValidation().setRules({
    price: { required: true },
    measurementId: requiredSelectRule(),
    translations: {
      required: true,
      custom: (value) => hasTitleTranslation(value) || translate('validation.title_required'),
    },
    itemTypeId: requiredSelectRule(),
    stageId: requiredSelectRule(),
    subStageId: requiredSelectRule(),
  });
  constructor(labor: {
    price?: number;
    measurementId?: number;
    translations?: { title: Record<string, string> };
    itemTypeId?: number;
    stageId?: number;
    subStageId?: number;
    status?: boolean;
  }) {
    this.price = labor.price;
    this.measurementId = labor.measurementId;
    this.translations = labor.translations;
    this.itemTypeId = labor.itemTypeId;
    this.stageId = labor.stageId;
    this.subStageId = labor.subStageId;
    this.status = labor.status;
  }
  toMap(): Record<string, unknown> {
    return {
      price: this.price,
      measurement_unit_id: this.measurementId,
      translations: this.translations,
      item_type_id: this.itemTypeId,
      stage_id: this.stageId,
      sub_stage_id: this.subStageId,
      status: this.status,
    };
  }
  validate() {
    return AddLaborParams.validation.validate(this);
  }
  validateOrThrow() {
    return AddLaborParams.validation.validateOrThrow(this);
  }
}
