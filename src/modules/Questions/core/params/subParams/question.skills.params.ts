import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';

export default class QuestionSkillParams implements Params {
  public skillId: number;
  public percentage: number;

  public static readonly validation = new ClassValidation().setRules({
    skillId: { required: true },
    percentage: { required: true },
  });

  constructor(data: { skillId: number; percentage: number }) {
    this.skillId = data.skillId;
    this.percentage = data.percentage;
  }

  toMap(): { [p: string]: any } {
    return {
      skill_id: this.skillId,
      percentage: this.percentage,
    };
  }

  validate() {
    return QuestionSkillParams.validation.validate(this);
  }

  validateOrThrow() {
    return QuestionSkillParams.validation.validateOrThrow(this);
  }
}
