import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';
import { validId } from '../../../Schedule/core/constants/schedule.constants';

export function decimalCents(value: string | number): number | null {
  const text = String(value);
  if (!/^(?:0|[1-9]\d*)(?:\.\d{1,2})?$/.test(text)) return null;
  const [whole, fraction = ''] = text.split('.');
  const cents = Number(whole) * 100 + Number(fraction.padEnd(2, '0'));
  return Number.isSafeInteger(cents) ? cents : null;
}

export default class PurchaseRequestReceiptItemParams implements Params {
  public purchaseRequestItemId: number;
  public quantity: number;
  constructor(purchaseRequestItemId: number, quantity: number) {
    this.purchaseRequestItemId = purchaseRequestItemId;
    this.quantity = quantity;
  }
  private static validation = new ClassValidation().setRules({
    purchaseRequestItemId: { required: true, custom: validId },
    quantity: {
      required: true,
      custom: (value: unknown) => {
        const cents = typeof value === 'number' ? decimalCents(value) : null;
        return cents !== null && cents > 0;
      },
    },
  });
  toMap() {
    return { purchase_request_item_id: this.purchaseRequestItemId, quantity: this.quantity };
  }
  validate() {
    return PurchaseRequestReceiptItemParams.validation.validate(this);
  }
  validateOrThrow() {
    PurchaseRequestReceiptItemParams.validation.validateOrThrow(this);
  }
}
