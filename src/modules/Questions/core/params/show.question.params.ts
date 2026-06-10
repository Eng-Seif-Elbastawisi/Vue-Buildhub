import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';

/**
 * Parameters for showing an employee
 */
export default class ShowquestionsParams implements Params {
  public id: number;

  public static readonly validation = new ClassValidation().setRules({
    id: { required: true },
  });

  constructor(id: number) {
    this.id = id;
  }

  toMap(): { [p: string]: any } {
    return {
      question_id: this.id,
    };
  }

  validate() {
    return ShowquestionsParams.validation.validate(this);
  }

  validateOrThrow() {
    return ShowquestionsParams.validation.validateOrThrow(this);
  }
}
