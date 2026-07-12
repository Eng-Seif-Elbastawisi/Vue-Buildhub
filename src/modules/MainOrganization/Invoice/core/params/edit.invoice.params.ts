import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';

export default class EditInvoiceParams implements Params {
  public invoice_id?: number;
  public project_id?: number;
  public invoice_number?: string;
  public invoice_date?: string;
  public invoice_amount?: number;
  public notes?: string | null;

  public static readonly validation = new ClassValidation().setRules({
    invoice_id: { required: true },
    project_id: { required: true },
    invoice_number: { required: true },
    invoice_date: { required: true },
    invoice_amount: { required: true },
  });

  constructor(data: {
    invoice_id?: number;
    project_id?: number;
    invoice_number?: string;
    invoice_date?: string;
    invoice_amount?: number;
    notes?: string | null;
  }) {
    this.invoice_id = data.invoice_id;
    this.project_id = data.project_id;
    this.invoice_number = data.invoice_number;
    this.invoice_date = data.invoice_date;
    this.invoice_amount = data.invoice_amount;
    this.notes = data.notes;
  }

  toMap(): Record<string, unknown> {
    return {
      invoice_id: this.invoice_id,
      project_id: this.project_id,
      invoice_number: this.invoice_number,
      invoice_date: this.invoice_date,
      invoice_amount: this.invoice_amount,
      notes: this.notes,
    };
  }

  validate() {
    return EditInvoiceParams.validation.validate(this);
  }

  validateOrThrow() {
    return EditInvoiceParams.validation.validateOrThrow(this);
  }
}
