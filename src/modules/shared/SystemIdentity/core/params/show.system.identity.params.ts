import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';

export default class ShowSystemIdentityParams implements Params {
  public static readonly validation = new ClassValidation().setRules({});

  toMap(): Record<string, never> {
    return {};
  }

  validate() {
    return ShowSystemIdentityParams.validation.validate(this);
  }

  validateOrThrow() {
    return ShowSystemIdentityParams.validation.validateOrThrow(this);
  }
}
