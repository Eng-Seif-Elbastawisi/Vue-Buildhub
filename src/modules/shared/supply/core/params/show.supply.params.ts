import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';

export default class ShowSupplyParams implements Params {
  public supply_id: number;
  public allLocales?: boolean;

  public static readonly validation = new ClassValidation().setRules({
    supply_id: { required: true },
  });

  constructor(data: { supply_id: number; allLocales?: boolean }) {
    this.supply_id = data.supply_id;
    this.allLocales = data.allLocales;
  }

  toMap(): { [p: string]: number } {
    return { supply_id: this.supply_id };
  }

  validate() {
    return ShowSupplyParams.validation.validate(this);
  }

  validateOrThrow() {
    return ShowSupplyParams.validation.validateOrThrow(this);
  }
}
