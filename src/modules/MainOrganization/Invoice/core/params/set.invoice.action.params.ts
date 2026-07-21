import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';
import {
  InvoiceActionStatusEnum,
  type InvoiceActionStatus,
} from '../constant/invoice.action.status.enum';

export default class SetInvoiceActionParams implements Params {
  public readonly project_id: number;
  public readonly action_status?: InvoiceActionStatus;
  public readonly invoice_ids: number[];

  public static readonly validation = new ClassValidation().setRules({
    project_id: {
      required: true,
      custom: (projectId) => Number.isInteger(projectId) && projectId > 0,
    },
    action_status: {
      required: true,
      custom: (actionStatus) => actionStatus === InvoiceActionStatusEnum.OFFER_ACCEPT,
    },
    invoice_ids: {
      required: true,
      custom: (invoiceIds) =>
        Array.isArray(invoiceIds) &&
        invoiceIds.length > 0 &&
        invoiceIds.every((invoiceId) => Number.isInteger(invoiceId) && invoiceId > 0),
    },
  });

  constructor(payload: {
    project_id: number;
    action_status?: InvoiceActionStatus;
    invoice_ids: number[];
  }) {
    this.project_id = payload.project_id;
    this.action_status = payload.action_status;
    this.invoice_ids = [...payload.invoice_ids];
  }

  toMap(): {
    project_id: number;
    action_status: InvoiceActionStatus | undefined;
    invoice_ids: number[];
  } {
    return {
      project_id: this.project_id,
      action_status: this.action_status,
      invoice_ids: this.invoice_ids,
    };
  }

  validate() {
    return SetInvoiceActionParams.validation.validate(this);
  }

  validateOrThrow() {
    return SetInvoiceActionParams.validation.validateOrThrow(this);
  }
}
