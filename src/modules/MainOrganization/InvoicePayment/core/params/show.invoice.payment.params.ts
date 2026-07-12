import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';

export default class ShowInvoicePaymentParams implements Params {
  public invoice_payment_id: number;

  public static readonly validation = new ClassValidation().setRules({
    invoice_payment_id: { required: true },
  });

  constructor(data: { invoice_payment_id: number }) {
    this.invoice_payment_id = data.invoice_payment_id;
  }

  toMap(): Record<string, number> {
    return {
      invoice_payment_id: this.invoice_payment_id,
    };
  }

  validate() {
    return ShowInvoicePaymentParams.validation.validate(this);
  }

  validateOrThrow() {
    return ShowInvoicePaymentParams.validation.validateOrThrow(this);
  }
}
