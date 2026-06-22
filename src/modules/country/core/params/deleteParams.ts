import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';

/**
 * Parameters for creating/updating employee email
 */
export default class DeleteCountryParams implements Params {
  public id: number;

  public static readonly validation = new ClassValidation().setRules({
    id: { required: true, minLength: 1 },
  });

  constructor(id: number) {
    this.id = id;
  }

  toMap(): { [p: string]: any } {
    const map: { [key: string]: any } = {
      id: this.id,
    };

    return map;
  }

  validate() {
    return DeleteCountryParams.validation.validate(this);
  }

  validateOrThrow() {
    return DeleteCountryParams.validation.validateOrThrow(this);
  }
}
