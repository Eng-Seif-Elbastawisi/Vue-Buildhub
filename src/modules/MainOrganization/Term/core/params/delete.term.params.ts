import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';

export default class DeleteTermParams implements Params {
  public termId: number;
  public static readonly validation = new ClassValidation().setRules({
    termId: { required: true },
  });

  constructor(data: { termId: number }) {
    this.termId = data.termId;
  }
  toMap(): Record<string, number> {
    return { term_id: this.termId };
  }
  validate() {
    return DeleteTermParams.validation.validate(this);
  }
  validateOrThrow() {
    return DeleteTermParams.validation.validateOrThrow(this);
  }
}
