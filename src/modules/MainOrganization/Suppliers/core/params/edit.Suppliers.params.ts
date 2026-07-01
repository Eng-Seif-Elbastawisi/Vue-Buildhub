import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';

export default class EditSuppliersParams implements Params {
  public suppliers_id: number;
  public name: string;
  public phone: string;

  public static readonly validation = new ClassValidation().setRules({
    // translations: { required: true },
  });

  constructor(data: {
    suppliers_id: number;
    name: string;
    phone: string;
  }) {
    this.suppliers_id = data.suppliers_id;
    this.name = data.name;
    this.phone = data.phone;
  }

  toMap(): { [p: string]: any } {
    const map: { [key: string]: any } = {
      supplier_id: this.suppliers_id,
      name: this.name,
      phone: this.phone,
    };

    return map;
  }

  validate() {
    return EditSuppliersParams.validation.validate(this);
  }

  validateOrThrow() {
    return EditSuppliersParams.validation.validateOrThrow(this);
  }
}
