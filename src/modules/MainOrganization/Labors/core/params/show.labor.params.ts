import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';

/**
 * Parameters for showing an employee
 */
export default class ShowLaborParams implements Params {
  public labor_id: number;
  public allLocales?: boolean;

  public static readonly validation = new ClassValidation().setRules({
    labor_id: { required: true },
  });

  constructor(data: { labor_id: number; allLocales?: boolean }) {
    this.labor_id = data.labor_id;
    this.allLocales = data.allLocales;
  }

  toMap(): { [p: string]: number } {
    return { labor_id: this.labor_id };
  }

  validate() {
    return ShowLaborParams.validation.validate(this);
  }

  validateOrThrow() {
    return ShowLaborParams.validation.validateOrThrow(this);
  }
}
