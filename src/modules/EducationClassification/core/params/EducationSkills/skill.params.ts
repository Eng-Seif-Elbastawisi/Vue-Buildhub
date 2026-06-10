import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';

export default class SkillParams implements Params {
  public skillId: number;
  public percentage: string;

  public static readonly validation = new ClassValidation().setRules({
    skillId: { required: true },
  });

  constructor(data: { skillId: number; percentage: string }) {
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
    return SkillParams.validation.validate(this);
  }

  validateOrThrow() {
    return SkillParams.validation.validateOrThrow(this);
  }
}
