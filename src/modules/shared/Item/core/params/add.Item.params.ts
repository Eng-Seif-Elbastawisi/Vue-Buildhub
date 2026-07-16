import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';
import { hasTitleTranslation, requiredSelectRule } from '@/base/Presentation/Utils/input_title';
import { translate } from '@/locales/i18n';
import type { ItemTypeEnum } from '../constant/item.type.enum copy';
import type { ItemStatusEnum } from '../constant/item.status.enum';
import type { ItemServiceTypeEnum } from '../constant/item.service.type.enum';

export default class AddItemParams implements Params {
  public type?: ItemTypeEnum;
  public status?: ItemStatusEnum;
  public service_type?: ItemServiceTypeEnum;
  public stage_id?: number;
  public department_id?: number;
  public measurement_unit_id?: number;
  public price?: number;
  public notes?: string;
  public translations?: { title: Record<string, string> };
  public static readonly validation = new ClassValidation().setRules({
    type: requiredSelectRule(),
    status: requiredSelectRule(),
    stage_id: requiredSelectRule(),
    department_id: requiredSelectRule(),
    measurement_unit_id: requiredSelectRule(),
    translations: {
      required: true,
      custom: (value) => hasTitleTranslation(value) || translate('validation.title_required'),
    },
  });
  constructor(data: {
    type?: ItemTypeEnum;
    status?: ItemStatusEnum;
    service_type?: ItemServiceTypeEnum;
    stage_id?: number;
    department_id?: number;
    measurement_unit_id?: number;
    price?: number;
    notes?: string;
    translations?: { title: Record<string, string> };
  }) {
    this.type = data.type;
    this.status = data.status;
    this.service_type = data.service_type;
    this.stage_id = data.stage_id;
    this.department_id = data.department_id;
    this.measurement_unit_id = data.measurement_unit_id;
    this.price = data.price;
    this.notes = data.notes;
    this.translations = data.translations;
  }
  toMap(): Record<string, unknown> {
    const map: Record<string, unknown> = {
      type: this.type,
      status: this.status,
      stage_id: this.stage_id,
      department_id: this.department_id,
      measurement_unit_id: this.measurement_unit_id,
      price: this.price,
      notes: this.notes,
      translations: this.translations,
    };

    if (this.service_type) {
      map.service_type = this.service_type;
    }

    return map;
  }
  validate() {
    return AddItemParams.validation.validate(this);
  }
  validateOrThrow() {
    return AddItemParams.validation.validateOrThrow(this);
  }
}
