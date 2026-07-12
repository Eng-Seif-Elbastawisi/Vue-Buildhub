import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';

export default class AddInvoiceParams implements Params {
  public project_id?: number;
  public invoice_number?: string;
  public invoice_date?: string;
  public invoice_amount?: number;
  public notes?: string | null;

  public static readonly validation = new ClassValidation().setRules({
    project_id: { required: true },
    invoice_number: { required: true },
    invoice_date: { required: true },
    invoice_amount: { required: true },
  });

  constructor(data: {
    project_id?: number;
    invoice_number?: string;
    invoice_date?: string;
    invoice_amount?: number;
    notes?: string | null;
  }) {
    this.project_id = data.project_id;
    this.invoice_number = data.invoice_number;
    this.invoice_date = data.invoice_date;
    this.invoice_amount = data.invoice_amount;
    this.notes = data.notes;
  }

  toMap(): Record<string, unknown> {
    return {
      project_id: this.project_id,
      invoice_number: this.invoice_number,
      invoice_date: this.invoice_date,
      invoice_amount: this.invoice_amount,
      notes: this.notes,
    };
  }

  validate() {
    return AddInvoiceParams.validation.validate(this);
  }

  validateOrThrow() {
    return AddInvoiceParams.validation.validateOrThrow(this);
  }
}
