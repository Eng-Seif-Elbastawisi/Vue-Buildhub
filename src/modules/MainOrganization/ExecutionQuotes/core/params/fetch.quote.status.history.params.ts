import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';

export default class FetchQuoteStatusHistoryParams implements Params {
  public quoteId: number;

  public static readonly validation = new ClassValidation().setRules({
    quoteId: { required: true },
  });

  constructor(data: { quoteId: number }) {
    this.quoteId = data.quoteId;
  }

  toMap(): Record<string, number> {
    return { quote_id: this.quoteId };
  }

  validate() {
    return FetchQuoteStatusHistoryParams.validation.validate(this);
  }

  validateOrThrow() {
    return FetchQuoteStatusHistoryParams.validation.validateOrThrow(this);
  }
}
