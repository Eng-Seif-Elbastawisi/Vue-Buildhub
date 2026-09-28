import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';

export default class DeleteExecutionQuoteItemParams implements Params {
  public readonly quoteItemId: number;

  public static readonly validation = new ClassValidation().setRules({
    quoteItemId: {
      required: true,
      custom: (value) => Number.isInteger(value) && value > 0,
    },
  });

  constructor(data: { quoteItemId: number }) {
    this.quoteItemId = data.quoteItemId;
  }

  toMap(): Record<string, number> {
    return { quote_stage_item_id: this.quoteItemId };
  }

  validate() {
    return DeleteExecutionQuoteItemParams.validation.validate(this);
  }

  validateOrThrow() {
    return DeleteExecutionQuoteItemParams.validation.validateOrThrow(this);
  }
}
