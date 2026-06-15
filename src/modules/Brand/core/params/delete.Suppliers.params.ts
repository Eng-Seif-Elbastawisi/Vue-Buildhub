import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';

export default class DeleteSuppliersParams implements Params {
  public suppliers_id: number;

  public static readonly validation = new ClassValidation().setRules({
    suppliers_id: { required: true },
  });

  constructor(data: { suppliers_id: number }) {
    this.suppliers_id = data.suppliers_id;
  }

  toMap(): { [p: string]: any } {
    return {
      suppliers_id: this.suppliers_id,
    };
  }

  validate() {
    return DeleteSuppliersParams.validation.validate(this);
  }

  validateOrThrow() {
    return DeleteSuppliersParams.validation.validateOrThrow(this);
  }
}
