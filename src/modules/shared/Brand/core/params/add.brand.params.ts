import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';
import { type EquipmentTypeEnum } from '../constant/equipment.type.enum';

export default class AddBrandParams implements Params {
  public name?: string;
  public equipment?: EquipmentTypeEnum;
  public static readonly validation = new ClassValidation().setRules({
    name: { required: false },
    equipment: { required: false },
  });
  constructor(data: { name?: string; equipment?: EquipmentTypeEnum }) {
    this.name = data.name;
    this.equipment = data.equipment;
  }
  toMap(): { [p: string]: any } {
    return {
      name: this.name,
      equipment: this.equipment,
    };
  }
  validate() {
    return AddBrandParams.validation.validate(this);
  }
  validateOrThrow() {
    return AddBrandParams.validation.validateOrThrow(this);
  }
}
