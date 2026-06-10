import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';

export default class DeleteEducationSubjectTopicParams implements Params {
  public entryId: number;

  public static readonly validation = new ClassValidation().setRules({});

  constructor(data: { entryId: number }) {
    this.entryId = data.entryId;
  }

  toMap(): { [p: string]: any } {
    return {
      education_classification_subject_topic_id: this.entryId,
    };
  }

  validate() {
    return DeleteEducationSubjectTopicParams.validation.validate(this);
  }

  validateOrThrow() {
    return DeleteEducationSubjectTopicParams.validation.validateOrThrow(this);
  }
}
