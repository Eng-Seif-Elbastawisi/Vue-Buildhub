import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';

/**
 * Parameters for adding a new country
 */
export default class ToggleStatusEducationClassificationParams implements Params {
  public id: number;

  public static readonly validation = new ClassValidation().setRules({
    id: { required: true, minLength: 2, maxLength: 100 },
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
    return ToggleStatusEducationClassificationParams.validation.validate(this);
  }

  validateOrThrow() {
    return ToggleStatusEducationClassificationParams.validation.validateOrThrow(this);
  }
}
