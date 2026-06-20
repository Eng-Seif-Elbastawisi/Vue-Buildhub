import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';

export default class ShowBrandParams implements Params {
  public brand_id: number;

  public static readonly validation = new ClassValidation().setRules({
    brand_id: { required: true },
  });

  constructor(data: { brand_id: number }) {
    this.brand_id = data.brand_id;
  }

  toMap(): { [p: string]: any } {
    return {
      brand_id: this.brand_id,
    };
  }

  validate() {
    return ShowBrandParams.validation.validate(this);
  }

  validateOrThrow() {
    return ShowBrandParams.validation.validateOrThrow(this);
  }
}
