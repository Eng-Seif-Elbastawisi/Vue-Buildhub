import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';

export default class DeleteEducationSubjectPricingParams implements Params {
  public pricingId: number;

  public static readonly validation = new ClassValidation().setRules({});

  constructor(data: { pricingId: number }) {
    this.pricingId = data.pricingId;
  }

  toMap(): { [p: string]: any } {
    return {
      education_classification_subject_pricing_id: this.pricingId,
    };
  }

  validate() {
    return DeleteEducationSubjectPricingParams.validation.validate(this);
  }

  validateOrThrow() {
    return DeleteEducationSubjectPricingParams.validation.validateOrThrow(this);
  }
}
