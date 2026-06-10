import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';

export default class ShowEducationSubjectSkillsParams implements Params {
  public entryId: number;

  public static readonly validation = new ClassValidation().setRules({});

  constructor(data: { entryId: number }) {
    this.entryId = data.entryId;
  }

  toMap(): { [p: string]: any } {
    return {
      education_classification_subject_skill_id: this.entryId,
    };
  }

  validate() {
    return ShowEducationSubjectSkillsParams.validation.validate(this);
  }

  validateOrThrow() {
    return ShowEducationSubjectSkillsParams.validation.validateOrThrow(this);
  }
}
