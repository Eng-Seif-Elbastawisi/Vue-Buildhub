import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';

/**
 * Parameters for deleting an employee
 */
export default class DeleteSupportContactParams implements Params {
  public id: number;

  public static readonly validation = new ClassValidation().setRules({
    id: { required: true },
  });

  constructor(id: number) {
    this.id = id;
  }

  toMap(): { [p: string]: any } {
    return {
      support_id: this.id,
    };
  }

  validate() {
    return DeleteSupportContactParams.validation.validate(this);
  }

  validateOrThrow() {
    return DeleteSupportContactParams.validation.validateOrThrow(this);
  }
}
