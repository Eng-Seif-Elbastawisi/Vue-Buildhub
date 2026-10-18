import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';
import { validId } from '../../../Schedule/core/constants/schedule.constants';
export default class FetchPurchaseRequestReceiptsParams implements Params {
  public purchaseRequestId: number;
  constructor(purchaseRequestId: number) {
    this.purchaseRequestId = purchaseRequestId;
  }
  private static validation = new ClassValidation().setRules({
    purchaseRequestId: { required: true, custom: validId },
  });
  toMap() {
    return { purchase_request_id: this.purchaseRequestId };
  }
  validate() {
    return FetchPurchaseRequestReceiptsParams.validation.validate(this);
  }
  validateOrThrow() {
    FetchPurchaseRequestReceiptsParams.validation.validateOrThrow(this);
  }
}
