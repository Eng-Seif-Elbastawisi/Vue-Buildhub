import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';

export default class ShowMaterialParams implements Params {
  public material_id: number;

  public static readonly validation = new ClassValidation().setRules({
    material_id: { required: true },
  });

  constructor(data: { material_id: number }) {
    this.material_id = data.material_id;
  }

  toMap(): { [p: string]: any } {
    return {
      material_id: this.material_id,
    };
  }

  validate() {
    return ShowMaterialParams.validation.validate(this);
  }

  validateOrThrow() {
    return ShowMaterialParams.validation.validateOrThrow(this);
  }
}
