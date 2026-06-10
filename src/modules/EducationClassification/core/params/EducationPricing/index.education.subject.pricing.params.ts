import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';

export default class IndexEducationSubjectPricingParams implements Params {
  public subjectId: number;

  public static readonly validation = new ClassValidation().setRules({});

  constructor(data: { subjectId: number }) {
    this.subjectId = data.subjectId;
  }

  toMap(): { [p: string]: any } {
    return {
      education_classification_subject_id: this.subjectId,
    };
  }

  validate() {
    return IndexEducationSubjectPricingParams.validation.validate(this);
  }

  validateOrThrow() {
    return IndexEducationSubjectPricingParams.validation.validateOrThrow(this);
  }
}
