import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';

/**
 * Parameters for creating/updating employee email
 */
export default class DeleteEducationClassificationParams implements Params {
  public id: number;

  public static readonly validation = new ClassValidation().setRules({
    id: { required: true, minLength: 1 },
  });

  constructor(data: { id: number }) {
    this.id = data.id;
  }

  toMap(): { [p: string]: any } {
    const map: { [key: string]: any } = {
      id: this.id,
    };

    return map;
  }

  validate() {
    return DeleteEducationClassificationParams.validation.validate(this);
  }

  validateOrThrow() {
    return DeleteEducationClassificationParams.validation.validateOrThrow(this);
  }
}
