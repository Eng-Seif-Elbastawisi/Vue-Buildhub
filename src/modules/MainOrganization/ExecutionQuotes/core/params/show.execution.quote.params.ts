import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';

export default class ShowExecutionQuoteParams implements Params {
  public readonly executionQuoteId: number;

  public static readonly validation = new ClassValidation().setRules({
    executionQuoteId: { required: true },
  });

  constructor(data: { executionQuoteId: number }) {
    this.executionQuoteId = data.executionQuoteId;
  }

  toMap(): Record<string, number> {
    return { quote_id: this.executionQuoteId };
  }

  validate() {
    return ShowExecutionQuoteParams.validation.validate(this);
  }

  validateOrThrow() {
    return ShowExecutionQuoteParams.validation.validateOrThrow(this);
  }
}
