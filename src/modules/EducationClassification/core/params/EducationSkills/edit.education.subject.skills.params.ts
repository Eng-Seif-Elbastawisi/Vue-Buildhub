import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';

export default class EditEducationSubjectSkillsParams implements Params {
  public entryId: number;
  public skillId: number;
  public percentage: string;
  public educationClassificationSubjectId: number;

  public static readonly validation = new ClassValidation().setRules({});

  constructor(data: {
    entryId: number;
    skillId: number;
    percentage: string;
    educationClassificationSubjectId: number;
  }) {
    this.entryId = data.entryId;
    this.skillId = data.skillId;
    this.percentage = data.percentage;
    this.educationClassificationSubjectId = data.educationClassificationSubjectId;
  }

  toMap(): { [p: string]: any } {
    return {
      education_classification_subject_skill_id: this.entryId,
      skill_id: this.skillId,
      percentage: this.percentage,
      education_classification_subject_id: this.educationClassificationSubjectId,
    };
  }

  validate() {
    return EditEducationSubjectSkillsParams.validation.validate(this);
  }

  validateOrThrow() {
    return EditEducationSubjectSkillsParams.validation.validateOrThrow(this);
  }
}
