import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';

export default class AddInvoicePaymentParams implements Params {
  public invoice_id?: number;
  public payment_amount?: number;
  public payment_date?: string;
  public payment_method?: number;
  public notes?: string | null;

  public static readonly validation = new ClassValidation().setRules({
    invoice_id: { required: true },
    payment_amount: { required: true },
    payment_date: { required: true },
    payment_method: { required: true },
  });

  constructor(data: {
    invoice_id?: number;
    payment_amount?: number;
    payment_date?: string;
    payment_method?: number;
    notes?: string | null;
  }) {
    this.invoice_id = data.invoice_id;
    this.payment_amount = data.payment_amount;
    this.payment_date = data.payment_date;
    this.payment_method = data.payment_method;
    this.notes = data.notes;
  }

  toMap(): Record<string, unknown> {
    return {
      invoice_id: this.invoice_id,
      payment_amount: this.payment_amount,
      payment_date: this.payment_date,
      payment_method: this.payment_method,
      notes: this.notes,
    };
  }

  validate() {
    return AddInvoicePaymentParams.validation.validate(this);
  }

  validateOrThrow() {
    return AddInvoicePaymentParams.validation.validateOrThrow(this);
  }
}
