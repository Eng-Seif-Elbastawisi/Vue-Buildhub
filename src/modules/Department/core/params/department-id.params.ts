import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';

export default class DepartmentIdParams implements Params {
  public readonly id: number;

  public static readonly validation = new ClassValidation().setRules({
    id: { required: true },
  });

  constructor(id: number) {
    this.id = id;
  }

  toMap(): Record<string, number> {
    return { id: this.id };
  }

  validate() {
    return DepartmentIdParams.validation.validate(this);
  }

  validateOrThrow() {
    return DepartmentIdParams.validation.validateOrThrow(this);
  }
}
