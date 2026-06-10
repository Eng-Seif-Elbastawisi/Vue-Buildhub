import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';

/**
 * Parameters for showing an employee
 */
export default class ShowSupportContactsParams implements Params {
  public static readonly validation = new ClassValidation().setRules({});

  constructor() {}

  toMap(): { [p: string]: any } {
    return {};
  }

  validate() {
    return ShowSupportContactsParams.validation.validate(this);
  }

  validateOrThrow() {
    return ShowSupportContactsParams.validation.validateOrThrow(this);
  }
}
