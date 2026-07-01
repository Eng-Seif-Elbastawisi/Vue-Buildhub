import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';

export default class ShowOrganizationToggledParams implements Params {
  public static readonly validation = new ClassValidation().setRules({});

  toMap(): Record<string, never> {
    return {};
  }

  validate() {
    return ShowOrganizationToggledParams.validation.validate(this);
  }

  validateOrThrow() {
    return ShowOrganizationToggledParams.validation.validateOrThrow(this);
  }
}
