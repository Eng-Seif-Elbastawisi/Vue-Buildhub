import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';

/**
 * Parameters for deleting an admin
 */
export default class DeleteAdminParams implements Params {
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
    return DeleteAdminParams.validation.validate(this);
  }

  validateOrThrow() {
    return DeleteAdminParams.validation.validateOrThrow(this);
  }
}
