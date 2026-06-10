import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';

/**
 * Parameters for showing a country
 */
export default class AddEducationSubjectPricingParams implements Params {
  public id: number;
  public duration: number;
  public durationType: number;
  public price: number;

  public static readonly validation = new ClassValidation().setRules({
    id: { required: true },
    duration: { required: true },

  });

  constructor(data: { id: number; duration: number; durationType: number; price: number }) {
    this.id = data.id;
    this.duration = data.duration;
    this.durationType = data.durationType;
    this.price = data.price;
  }

  toMap(): { [p: string]: any } {
    const map: { [key: string]: any } = {
      education_classification_subject_id: this.id,
      duration: this.duration,
      duration_type: this.durationType,
      price: this.price,
    };

    return map;
  }

  validate() {
    return AddEducationSubjectPricingParams.validation.validate(this);
  }

  validateOrThrow() {
    return AddEducationSubjectPricingParams.validation.validateOrThrow(this);
  }
}
