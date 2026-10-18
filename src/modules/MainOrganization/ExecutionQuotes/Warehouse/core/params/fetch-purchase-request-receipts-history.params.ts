import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';
import { validId } from '../../../Schedule/core/constants/schedule.constants';
export default class FetchPurchaseRequestReceiptsHistoryParams implements Params {
  public quoteId: number;
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
    return FetchPurchaseRequestReceiptsHistoryParams.validation.validate(this);
  }
  validateOrThrow() {
    FetchPurchaseRequestReceiptsHistoryParams.validation.validateOrThrow(this);
  }
}
