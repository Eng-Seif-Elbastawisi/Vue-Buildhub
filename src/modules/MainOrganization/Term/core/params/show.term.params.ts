import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';

export default class ShowTermParams implements Params {
  public termId: number;
  public allLocales?: boolean;
  public static readonly validation = new ClassValidation().setRules({
    termId: { required: true },
  });

  constructor(data: { termId: number; allLocales?: boolean }) {
    this.termId = data.termId;
    this.allLocales = data.allLocales;
  }
  toMap(): Record<string, number> {
    return { term_id: this.termId };
  }
  validate() {
    return ShowTermParams.validation.validate(this);
  }
  validateOrThrow() {
    return ShowTermParams.validation.validateOrThrow(this);
  }
}
