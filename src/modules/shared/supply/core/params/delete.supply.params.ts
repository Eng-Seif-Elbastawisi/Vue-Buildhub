import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';

export default class DeleteSupplyParams implements Params {
  public supply_id: number;

  public static readonly validation = new ClassValidation().setRules({
    supply_id: { required: true },
  });

  constructor(data: { supply_id: number }) {
    this.supply_id = data.supply_id;
  }

  toMap(): { [p: string]: any } {
    return {
      supply_id: this.supply_id,
    };
  }

  validate() {
    return DeleteSupplyParams.validation.validate(this);
  }

  validateOrThrow() {
    return DeleteSupplyParams.validation.validateOrThrow(this);
  }
}
