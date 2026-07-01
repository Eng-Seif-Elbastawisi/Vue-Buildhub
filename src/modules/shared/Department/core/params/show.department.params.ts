import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';

export default class ShowDepartmentParams implements Params {
  public id: number;
  public allLocales?: boolean;

  public static readonly validation = new ClassValidation().setRules({
    id: { required: true },
  });

  constructor(data: { id: number; allLocales?: boolean }) {
    this.id = data.id;
    this.allLocales = data.allLocales;
  }

  toMap(): { [p: string]: number } {
    return { department_id: this.id };
  }

  validate() {
    return ShowDepartmentParams.validation.validate(this);
  }

  validateOrThrow() {
    return ShowDepartmentParams.validation.validateOrThrow(this);
  }
}
