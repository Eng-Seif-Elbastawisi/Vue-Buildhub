import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';
import { hasTitleTranslation, requiredSelectRule } from '@/base/Presentation/Utils/input_title';
import { translate } from '@/locales/i18n';

export default class EditLaborParams implements Params {
  public laborId?: number;
  public price?: number;
  public measurementId?: number;
  public translations?: { title: Record<string, string> };
  public itemTypeId?: number;
  public stageId?: number;
  public subStageIds?: number[];
  public status?: boolean;

  public static readonly validation = new ClassValidation().setRules({
    laborId: { required: true },
    price: { required: true },
    measurementId: requiredSelectRule(),
    translations: {
      required: true,
      custom: (value) => hasTitleTranslation(value) || translate('validation.title_required'),
    },
    itemTypeId: requiredSelectRule(),
    stageId: requiredSelectRule(),
    subStageIds: requiredSelectRule(),
  });

  constructor(labor: {
    laborId?: number;
    price?: number;
    measurementId?: number;
    translations?: { title: Record<string, string> };
    itemTypeId?: number;
    stageId?: number;
    subStageIds?: number[];
    status?: boolean;
  }) {
    this.laborId = labor.laborId;
    this.price = labor.price;
    this.measurementId = labor.measurementId;
    this.translations = labor.translations;
    this.itemTypeId = labor.itemTypeId;
    this.stageId = labor.stageId;
    this.subStageIds = labor.subStageIds;
    this.status = labor.status;
  }

  toMap(): Record<string, unknown> {
    return {
      labor_id: this.laborId,
      price: this.price,
      measurement_unit_id: this.measurementId,
      translations: this.translations,
      item_type_id: this.itemTypeId,
      stage_id: this.stageId,
      sub_stage_ids: this.subStageIds,
      status: this.status,
    };
  }

  validate() {
    return EditLaborParams.validation.validate(this);
  }

  validateOrThrow() {
    return EditLaborParams.validation.validateOrThrow(this);
  }
}
