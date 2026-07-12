import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';

export default class DeleteInvoiceParams implements Params {
  public invoice_id: number;

  public static readonly validation = new ClassValidation().setRules({
    invoice_id: { required: true },
  });

  constructor(data: { invoice_id: number }) {
    this.invoice_id = data.invoice_id;
  }

  toMap(): Record<string, number> {
    return {
      invoice_id: this.invoice_id,
    };
  }

  validate() {
    return DeleteInvoiceParams.validation.validate(this);
  }

  validateOrThrow() {
    return DeleteInvoiceParams.validation.validateOrThrow(this);
  }
}
