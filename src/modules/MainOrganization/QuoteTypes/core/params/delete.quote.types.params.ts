import type Params from '@/base/Core/Params/params';

import { ClassValidation } from '@/base/Presentation/Utils/classValidation';

/**
 * Parameters for deleting a quote type
 */
export default class DeleteQuoteTypeParams implements Params {
  public id: number;

  public static readonly validation = new ClassValidation().setRules({
    id: {
      required: true,
      minLength: 1,
    },
  });

  constructor(id: number) {
    this.id = id;
  }

  toMap(): { [p: string]: any } {
    const map: { [key: string]: any } = {
      quote_type: this.id,
    };

    return map;
  }

  validate() {
    return DeleteQuoteTypeParams.validation.validate(this);
  }

  validateOrThrow() {
    return DeleteQuoteTypeParams.validation.validateOrThrow(this);
  }
}
