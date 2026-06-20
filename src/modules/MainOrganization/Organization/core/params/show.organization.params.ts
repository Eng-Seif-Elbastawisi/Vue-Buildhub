import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';

export default class ShowOrganizationParams implements Params {
  public organization_id: number;
  public allLocales?: boolean;

  public static readonly validation = new ClassValidation().setRules({
    organization_id: { required: true },
  });

  constructor(data: { organization_id: number; allLocales?: boolean }) {
    this.organization_id = data.organization_id;
    this.allLocales = data.allLocales;
  }

  toMap(): { [p: string]: any } {
    return {
      organization_id: this.organization_id,
    };
  }

  validate() {
    return ShowOrganizationParams.validation.validate(this);
  }

  validateOrThrow() {
    return ShowOrganizationParams.validation.validateOrThrow(this);
  }
}
