import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';

export default class EditEducationSubjectPricingParams implements Params {
  public pricingId: number;
  public duration: number;
  public durationType: number;
  public price: number;

  public static readonly validation = new ClassValidation().setRules({});

  constructor(data: { pricingId: number; duration: number; durationType: number; price: number }) {
    this.pricingId = data.pricingId;
    this.duration = data.duration;
    this.durationType = data.durationType;
    this.price = data.price;
  }

  toMap(): { [p: string]: any } {
    return {
      education_classification_subject_pricing_id: this.pricingId,
      duration: this.duration,
      duration_type: this.durationType,
      price: this.price,
    };
  }

  validate() {
    return EditEducationSubjectPricingParams.validation.validate(this);
  }

  validateOrThrow() {
    return EditEducationSubjectPricingParams.validation.validateOrThrow(this);
  }
}
