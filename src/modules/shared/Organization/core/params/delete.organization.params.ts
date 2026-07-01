import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';

export default class DeleteOrganizationParams implements Params {
  public organization_id: number;

  public static readonly validation = new ClassValidation().setRules({
    organization_id: { required: true },
  });

  constructor(data: { organization_id: number }) {
    this.organization_id = data.organization_id;
  }

  toMap(): { [p: string]: any } {
    return {
      organization_id: this.organization_id,
    };
  }

  validate() {
    return DeleteOrganizationParams.validation.validate(this);
  }

  validateOrThrow() {
    return DeleteOrganizationParams.validation.validateOrThrow(this);
  }
}
