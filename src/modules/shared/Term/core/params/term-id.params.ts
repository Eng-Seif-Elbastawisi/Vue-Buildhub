import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';

export default class TermIdParams implements Params {
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
    return TermIdParams.validation.validate(this);
  }

  validateOrThrow() {
    return TermIdParams.validation.validateOrThrow(this);
  }
}
