import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';

export default class IndexEducationSubjectTopicParams implements Params {
  public SubjectId: number;

  public static readonly validation = new ClassValidation().setRules({});

  constructor(data: { SubjectId: number }) {
    this.SubjectId = data.SubjectId;
  }

  toMap(): { [p: string]: any } {
    return {
      education_classification_subject_id: this.SubjectId,
    };
  }

  validate() {
    return IndexEducationSubjectTopicParams.validation.validate(this);
  }

  validateOrThrow() {
    return IndexEducationSubjectTopicParams.validation.validateOrThrow(this);
  }
}
