import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';

export default class DeleteEducationSubjectItemParams implements Params {
  public subject_id: number;

  public static readonly validation = new ClassValidation().setRules({});

  constructor(data: { subject_id: number }) {
    this.subject_id = data.subject_id;
  }

  toMap(): { [p: string]: any } {
    return {
      education_classification_subject_id: this.subject_id,
    };
  }

  validate() {
    return DeleteEducationSubjectItemParams.validation.validate(this);
  }

  validateOrThrow() {
    return DeleteEducationSubjectItemParams.validation.validateOrThrow(this);
  }
}
