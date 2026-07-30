import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';

export default class FetchOrganizationPackageSubscriptionsParams implements Params {
  public static readonly validation = new ClassValidation().setRules({});

  public toMap(): Record<string, never> {
    return {};
  }

  public validate() {
    return FetchOrganizationPackageSubscriptionsParams.validation.validate(this);
  }

  public validateOrThrow(): void {
    FetchOrganizationPackageSubscriptionsParams.validation.validateOrThrow(this);
  }
}
