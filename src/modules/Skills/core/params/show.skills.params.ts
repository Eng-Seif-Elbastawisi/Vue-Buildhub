import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';

/**
 * Parameters for showing an employee
 */
export default class ShowSkillsParams implements Params {
  public id: number;
  public AllLocale: boolean;


  public static readonly validation = new ClassValidation().setRules({
    id: { required: true },
  });

  constructor(id: number , AllLocale:boolean = false) {
    this.id = id;
    this.AllLocale = AllLocale;
  }

  toMap(): { [p: string]: any } {
    return {
      skill_id: this.id,
    };
  }

  validate() {
    return ShowSkillsParams.validation.validate(this);
  }

  validateOrThrow() {
    return ShowSkillsParams.validation.validateOrThrow(this);
  }
}
