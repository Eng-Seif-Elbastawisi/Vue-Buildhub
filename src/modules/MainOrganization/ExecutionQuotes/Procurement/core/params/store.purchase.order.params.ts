import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';
import { validId } from '../../../Schedule/core/constants/schedule.constants';
export default class StorePurchaseOrderParams implements Params {
  public purchaseRequestId: number;
  public purchaseRequestPriceId: number;
  public note: string | null;
  public file: string | null;
  public date: string;
  constructor(
    purchaseRequestId: number,
    purchaseRequestPriceId: number,
    note: string | null,
    file: string | null,
    date: string,
  ) {
    this.purchaseRequestId = purchaseRequestId;
    this.purchaseRequestPriceId = purchaseRequestPriceId;
    this.note = note;
    this.file = file;
    this.date = date;
  }
  private static validation = new ClassValidation().setRules({
    purchaseRequestId: { required: true, custom: validId },
    purchaseRequestPriceId: { required: true, custom: validId },
    date: {
      required: true,
      custom: (value: unknown) => {
        if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
        const parsed = new Date(value);
        return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
      },
    },
    note: { custom: (value: unknown) => value == null || typeof value === 'string' },
    file: {
      custom: (value: unknown) =>
        value == null ||
        (typeof value === 'string' && /^data:[^,]*;base64,[A-Za-z0-9+/]+={0,2}$/.test(value)),
    },
  });
  toMap() {
    return {
      purchase_request_id: this.purchaseRequestId,
      purchase_request_price_id: this.purchaseRequestPriceId,
      note: this.note,
      date: this.date,
      ...(this.file == null ? {} : { file: this.file }),
    };
  }
  validate() {
    return StorePurchaseOrderParams.validation.validate(this);
  }
  validateOrThrow() {
    StorePurchaseOrderParams.validation.validateOrThrow(this);
  }
}
