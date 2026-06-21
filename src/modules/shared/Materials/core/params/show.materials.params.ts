import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';

export default class ShowMaterialParams implements Params {
  public material_id: number;
  public allLocales?: boolean;

  public static readonly validation = new ClassValidation().setRules({
    material_id: { required: true },
  });

  constructor(data: { material_id: number; allLocales?: boolean }) {
    this.material_id = data.material_id;
    this.allLocales = data.allLocales;
  }

  toMap(): { [p: string]: number } {
    return { material_id: this.material_id };
  }

  validate() {
    return ShowMaterialParams.validation.validate(this);
  }

  validateOrThrow() {
    return ShowMaterialParams.validation.validateOrThrow(this);
  }
}
