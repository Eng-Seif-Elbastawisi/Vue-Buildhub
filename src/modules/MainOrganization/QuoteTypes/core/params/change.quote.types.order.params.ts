import type Params from '@/base/Core/Params/params';

import { ClassValidation } from '@/base/Presentation/Utils/classValidation';

/**
 * Parameters for changing quote type order
 */
export default class ChangeQuoteTypeOrderParams implements Params {
  public quoteTypeId: number;
  public order: number;

  public static readonly validation = new ClassValidation().setRules({
    quoteTypeId: { required: true },
    order: { required: true },
  });

  constructor(data: { quoteTypeId: number; order: number }) {
    this.quoteTypeId = data.quoteTypeId;
    this.order = data.order;
  }

  toMap(): { [p: string]: any } {
    return {
      quote_type: this.quoteTypeId,
      order: this.order,
    };
  }

  validate() {
    return ChangeQuoteTypeOrderParams.validation.validate(this);
  }

  validateOrThrow() {
    return ChangeQuoteTypeOrderParams.validation.validateOrThrow(this);
  }
}
