import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';
import { validId } from '../../../Schedule/core/constants/schedule.constants';
import { decimalCents } from './purchase-request-receipt-item.params';

export default class PurchaseRequestDisbursementItemParams implements Params {
  readonly purchaseRequestItemId: number;
  readonly quantity: number;

  constructor(purchaseRequestItemId: number, quantity: number) {
    this.purchaseRequestItemId = purchaseRequestItemId;
    this.quantity = quantity;
  }

  private static validation = new ClassValidation().setRules({
    purchaseRequestItemId: { required: true, custom: validId },
    quantity: {
      required: true,
      custom: (value: unknown) => typeof value === 'number' && (decimalCents(value) ?? 0) > 0,
    },
  });

  toMap() {
    return { purchase_request_item_id: this.purchaseRequestItemId, quantity: this.quantity };
  }

  validate() {
    return PurchaseRequestDisbursementItemParams.validation.validate(this);
  }

  validateOrThrow() {
    PurchaseRequestDisbursementItemParams.validation.validateOrThrow(this);
  }
}
