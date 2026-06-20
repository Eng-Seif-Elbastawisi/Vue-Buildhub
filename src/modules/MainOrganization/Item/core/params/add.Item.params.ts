import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';
import type { ItemTypeEnum } from '../constant/item.type.enum copy';
import type { ItemStatusEnum } from '../constant/item.status.enum';

export default class AddItemParams implements Params {
  public type?: ItemTypeEnum;
  public status?: ItemStatusEnum;
  public stage_id?: number;
  public department_id?: number;
  public measurement_unit_id?: number;
  public price?: number;
  public notes?: string;
  public translations?: { title: Record<string, string> };
  public static readonly validation = new ClassValidation().setRules({
    // type: { required: true },
    // translations: { required: true },
  });
  constructor(data: {
    type?: ItemTypeEnum;
    status?: ItemStatusEnum;
    stage_id?: number;
    department_id?: number;
    measurement_unit_id?: number;
    price?: number;
    notes?: string;
    translations?: { title: Record<string, string> };
  }) {
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
    return {
      type: this.type,
      status: this.status,
      stage_id: this.stage_id,
      department_id: this.department_id,
      measurement_unit_id: this.measurement_unit_id,
      price: this.price,
      notes: this.notes,
      translations: this.translations,
    };
  }
  validate() {
    return AddItemParams.validation.validate(this);
  }
  validateOrThrow() {
    return AddItemParams.validation.validateOrThrow(this);
  }
}
