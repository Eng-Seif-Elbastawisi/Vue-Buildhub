import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';

export default class ShowProjectPricingParams implements Params {
  public project_pricing_id: number;
  public allLocales?: boolean;

  public static readonly validation = new ClassValidation().setRules({
    project_pricing_id: { required: true },
  });

  constructor(data: { project_pricing_id: number; allLocales?: boolean }) {
    this.project_pricing_id = data.project_pricing_id;
    this.allLocales = data.allLocales;
  }

  toMap(): { [p: string]: number } {
    return { project_pricing_id: this.project_pricing_id };
  }

  validate() {
    return ShowProjectPricingParams.validation.validate(this);
  }

  validateOrThrow() {
    return ShowProjectPricingParams.validation.validateOrThrow(this);
  }
}
