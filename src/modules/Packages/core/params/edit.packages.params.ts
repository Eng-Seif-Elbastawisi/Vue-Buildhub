import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';

/**
 * Parameters for adding a new employee
 */
export default class EditPackagesParams implements Params {
  public id: number;
  public title: string;

  public static readonly validation = new ClassValidation().setRules({
    title: { required: true },
  });

  constructor(data: { id: number; title: string }) {
    this.id = data.id;
    this.title = data.title;
  }

  toMap(): { [p: string]: any } {
    return {
      id: this.id,
      title: this.title,
    };
  }

  validate() {
    return EditPackagesParams.validation.validate(this);
  }

  validateOrThrow() {
    return EditPackagesParams.validation.validateOrThrow(this);
  }
}
