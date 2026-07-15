import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';
import { hasTitleTranslation, requiredSelectRule } from '@/base/Presentation/Utils/input_title';
import { translate } from '@/locales/i18n';
import { type ItemStatusEnum } from '../constant/item.status.enum';
import { type ItemTypeEnum } from '../constant/item.type.enum copy';

export default class EditItemParams implements Params {
  public item_id?: number;
  public type?: ItemTypeEnum;
  public status?: ItemStatusEnum;
  public stage_id?: number;
  public department_id?: number;
  public measurement_unit_id?: number;
  public price?: number;
  public notes?: string;
  public translations?: { title: Record<string, string> };

  public static readonly validation = new ClassValidation().setRules({
    // item_id: { required: true },
    type: requiredSelectRule(),
    status: requiredSelectRule(),
    stage_id: requiredSelectRule(),
    department_id: requiredSelectRule(),
    measurement_unit_id: requiredSelectRule(),
    // price: { required: true },
    // notes: { required: true },
    translations: {
      required: true,
      custom: (value) => hasTitleTranslation(value) || translate('validation.title_required'),
    },
  });

  constructor(data: {
    item_id?: number;
    type?: ItemTypeEnum;
    status?: ItemStatusEnum;
    stage_id?: number;
    department_id?: number;
    measurement_unit_id?: number;
    price?: number;
    notes?: string;
    translations?: { title: Record<string, string> };
  }) {
    this.item_id = data.item_id;
    this.type = data.type;
    this.status = data.status;
    this.stage_id = data.stage_id;
    this.department_id = data.department_id;
    this.measurement_unit_id = data.measurement_unit_id;
    this.price = data.price;
    this.notes = data.notes;
    this.translations = data.translations;
  }

  toMap(): Record<string, unknown> {
    const map: Record<string, unknown> = {
      item_id: this.item_id,
      type: this.type,
      service_type: this.status,
      stage_id: this.stage_id,
      department_id: this.department_id,
      measurement_unit_id: this.measurement_unit_id,
      price: this.price,
      notes: this.notes,
      translations: this.translations,
    };

    return map;
  }

  validate() {
    return EditItemParams.validation.validate(this);
  }

  validateOrThrow() {
    return EditItemParams.validation.validateOrThrow(this);
  }
}
