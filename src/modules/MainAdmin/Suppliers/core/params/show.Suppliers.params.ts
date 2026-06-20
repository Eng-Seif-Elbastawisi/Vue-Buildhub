import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';

export default class ShowSuppliersParams implements Params {
  public suppliers_id: number;
  public allLocales?: boolean;

  public static readonly validation = new ClassValidation().setRules({
    suppliers_id: { required: true },
  });

  constructor(data: { suppliers_id: number; allLocales?: boolean }) {
    this.suppliers_id = data.suppliers_id;
    this.allLocales = data.allLocales;
  }

  toMap(): { [p: string]: any } {
    return {
      suppliers_id: this.suppliers_id,
    };
  }

  validate() {
    return ShowSuppliersParams.validation.validate(this);
  }

  validateOrThrow() {
    return ShowSuppliersParams.validation.validateOrThrow(this);
  }
}
