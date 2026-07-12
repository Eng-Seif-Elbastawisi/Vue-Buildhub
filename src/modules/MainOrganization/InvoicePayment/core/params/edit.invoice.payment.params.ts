import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';

export default class EditInvoicePaymentParams implements Params {
  public invoice_payment_id?: number;
  public invoice_id?: number;
  public payment_amount?: number;
  public payment_date?: string;
  public payment_method?: number;
  public notes?: string | null;

  public static readonly validation = new ClassValidation().setRules({
    invoice_payment_id: { required: true },
    invoice_id: { required: true },
    payment_amount: { required: true },
    payment_date: { required: true },
    payment_method: { required: true },
  });

  constructor(data: {
    invoice_payment_id?: number;
    invoice_id?: number;
    payment_amount?: number;
    payment_date?: string;
    payment_method?: number;
    notes?: string | null;
  }) {
    this.invoice_payment_id = data.invoice_payment_id;
    this.invoice_id = data.invoice_id;
    this.payment_amount = data.payment_amount;
    this.payment_date = data.payment_date;
    this.payment_method = data.payment_method;
    this.notes = data.notes;
  }

  toMap(): Record<string, unknown> {
    return {
      invoice_payment_id: this.invoice_payment_id,
      invoice_id: this.invoice_id,
      payment_amount: this.payment_amount,
      payment_date: this.payment_date,
      payment_method: this.payment_method,
      notes: this.notes,
    };
  }

  validate() {
    return EditInvoicePaymentParams.validation.validate(this);
  }

  validateOrThrow() {
    return EditInvoicePaymentParams.validation.validateOrThrow(this);
  }
}
