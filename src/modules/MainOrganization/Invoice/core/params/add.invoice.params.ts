import type Params from '@/base/Core/Params/params';
import {
  ClassValidation,
  type FieldError,
  ValidationError,
} from '@/base/Presentation/Utils/classValidation';
import {
  InvoiceTypeEnum,
  type InvoiceTypeEnum as InvoiceType,
} from '../constant/invoice.type.enum';
import { ServiceType } from '@/modules/MainOrganization/Project/core/constants/serviceType.enum';

export default class AddInvoiceParams implements Params {
  public type?: InvoiceType;
  public project_id?: number;
  public title?: string;
  public invoice_ids?: number[];
  public invoice_number?: string;
  public invoice_date?: string;
  public invoice_amount?: number;
  public notes?: string | null;
  

  public static readonly validation = new ClassValidation().setRules({
    type: {
      required: true,
      custom: (invoiceType?: InvoiceType) =>
        invoiceType === InvoiceTypeEnum.SINGLE || invoiceType === InvoiceTypeEnum.GROUP,
    },
    project_id: { required: true },
  });

  private static readonly detailsValidation = new ClassValidation().setRules({
    invoice_date: { required: true },
    invoice_amount: { required: true },
  });

  private static readonly groupValidation = new ClassValidation().setRules({
    title: { required: true },
    invoice_ids: { required: true },
  });

  constructor(data: {
    type?: InvoiceType;
    project_id?: number;
    title?: string;
    invoice_ids?: number[];
    invoice_number?: string;
    invoice_date?: string;
    invoice_amount?: number;
    notes?: string | null;
  }) {
    this.type = data.type;
    this.project_id = data.project_id;
    this.title = data.title;
    this.invoice_ids = data.invoice_ids;
    this.invoice_number = data.invoice_number;
    this.invoice_date = data.invoice_date;
    this.invoice_amount = data.invoice_amount;
    this.notes = data.notes;
  }

  toMap(): Record<string, unknown> {
    const invoiceBase = {
      invoice_type: this.type,
      project_id: this.project_id,
              title: this.title,
      type: ServiceType.DESIGNONLY,
    };

    if (this.type === InvoiceTypeEnum.GROUP) {
      return {
        ...invoiceBase,
        invoice_ids: this.invoice_ids,
      };
    }

    

    return {
      ...invoiceBase,
      invoice_date: this.invoice_date,
      invoice_amount: this.invoice_amount,
      notes: this.notes,
    };
  }

  private getConditionalErrors(): FieldError[] {
    if (this.type === InvoiceTypeEnum.SINGLE) {
      return AddInvoiceParams.detailsValidation.validate(this).errors;
    }

    if (this.type === InvoiceTypeEnum.GROUP) {
      return AddInvoiceParams.groupValidation.validate(this).errors;
    }

    return [];
  }

  validate() {
    const baseValidation = AddInvoiceParams.validation.validate(this);
    const errors = [...baseValidation.errors, ...this.getConditionalErrors()];

    return { isValid: errors.length === 0, errors };
  }

  validateOrThrow() {
    const validation = this.validate();

    if (!validation.isValid) {
      const validationError = new ValidationError(validation.errors);
      validationError.openDialog();
    }
  }
}
