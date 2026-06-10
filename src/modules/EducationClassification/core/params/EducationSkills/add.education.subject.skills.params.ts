import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';
import type SkillParams from './skill.params';

export default class AddEducationSubjectSkillsParams implements Params {
  public id: number;
  public skills: SkillParams[];

  public static readonly validation = new ClassValidation().setRules({});

  constructor(data: { id: number; skills: SkillParams[] }) {
    this.id = data.id;
    this.skills = data.skills;
  }

  toMap(): { [p: string]: any } {
    return {
      education_classification_subject_id: this.id,
      skills: this.skills.map((skill) => skill.toMap()),
    };
  }

  validate() {
    return AddEducationSubjectSkillsParams.validation.validate(this);
  }

  validateOrThrow() {
    return AddEducationSubjectSkillsParams.validation.validateOrThrow(this);
  }
}
