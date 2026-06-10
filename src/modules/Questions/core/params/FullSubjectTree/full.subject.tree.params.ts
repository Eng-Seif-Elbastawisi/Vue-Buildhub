import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';

/**
 * Parameters for showing an employee
 */
export default class FullSubjectTreeParams implements Params {
  public id: number;

  public static readonly validation = new ClassValidation().setRules({
    id: { required: true },
  });

  constructor(data: { id: number }) {
    this.id = data.id;
  }

  toMap(): { [p: string]: any } {
    return {
      education_classification_branch_id: this.id,
    };
  }

  validate() {
    return FullSubjectTreeParams.validation.validate(this);
  }

  validateOrThrow() {
    return FullSubjectTreeParams.validation.validateOrThrow(this);
  }
}
