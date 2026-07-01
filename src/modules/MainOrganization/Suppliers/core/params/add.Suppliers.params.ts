import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';

export default class AddSuppliersParams implements Params {
  public name?: string;

  public phone?: string;

  public static readonly validation = new ClassValidation().setRules({
    name: { required: false },

    phone: { required: false },

  });
  constructor(data: {
    name?: string;

    phone?: string;

  }) {
    this.name = data.name;
    this.phone = data.phone;
  }
  toMap(): { [p: string]: any } {
    return {
      name: this.name,
      phone: this.phone,
    };
  }
  validate() {
    return AddSuppliersParams.validation.validate(this);
  }
  validateOrThrow() {
    return AddSuppliersParams.validation.validateOrThrow(this);
  }
}
