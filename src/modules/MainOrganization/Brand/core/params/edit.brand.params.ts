import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';
import { EquipmentTypeEnum } from '../constant/equipment.type.enum';

export default class EditBrandParams implements Params {
  public brand_id?: number;
  public equipment?: EquipmentTypeEnum;

  public static readonly validation = new ClassValidation().setRules({
    brand_id: { required: true },
  });

  constructor(data: {
    brand_id?: number;
    equipment?: EquipmentTypeEnum;
  }) {
    this.brand_id = data.brand_id;
    this.equipment = data.equipment;
  }

  toMap(): { [p: string]: any } {
    const map: { [key: string]: any } = {
      brand_id: this.brand_id,
      equipment: this.equipment,
    };

    return map;
  }

  validate() {
    return EditBrandParams.validation.validate(this);
  }

  validateOrThrow() {
    return EditBrandParams.validation.validateOrThrow(this);
  }
}