import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';

/**
 * Parameters for showing an admin
 */
export default class ShowAdminParams implements Params {
  public id: number;

  public static readonly validation = new ClassValidation().setRules({
    id: { required: true },
  });

  constructor(id: number) {
    this.id = id;
  }

  toMap(): { [p: string]: any } {
    return {
      admin_id: this.id,
    };
  }

  validate() {
    return ShowAdminParams.validation.validate(this);
  }

  validateOrThrow() {
    return ShowAdminParams.validation.validateOrThrow(this);
  }
}
