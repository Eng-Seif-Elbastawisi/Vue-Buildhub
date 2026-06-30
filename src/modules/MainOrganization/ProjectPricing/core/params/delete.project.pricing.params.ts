import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';

export default class DeleteProjectPricingParams implements Params {
  public project_pricing_id: number;

  public static readonly validation = new ClassValidation().setRules({
    project_pricing_id: { required: true },
  });

  constructor(data: { project_pricing_id: number }) {
    this.project_pricing_id = data.project_pricing_id;
  }

  toMap(): Record<string, number> {
    return {
      project_pricing_id: this.project_pricing_id,
    };
  }

  validate() {
    return DeleteProjectPricingParams.validation.validate(this);
  }

  validateOrThrow() {
    return DeleteProjectPricingParams.validation.validateOrThrow(this);
  }
}
