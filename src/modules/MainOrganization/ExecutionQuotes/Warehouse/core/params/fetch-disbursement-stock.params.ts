import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';
import { validId } from '../../../Schedule/core/constants/schedule.constants';

export default class FetchDisbursementStockParams implements Params {
  readonly quoteId: number;

  constructor(quoteId: number) {
    this.quoteId = quoteId;
  }

  private static validation = new ClassValidation().setRules({
    quoteId: { required: true, custom: validId },
  });

  toMap() {
    return { quote_id: this.quoteId };
  }

  validate() {
    return FetchDisbursementStockParams.validation.validate(this);
  }

  validateOrThrow() {
    FetchDisbursementStockParams.validation.validateOrThrow(this);
  }
}
