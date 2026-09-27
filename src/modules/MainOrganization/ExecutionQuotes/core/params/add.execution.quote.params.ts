import type Params from '@/base/Core/Params/params';
import {
  ClassValidation,
  type FieldError,
  ValidationError,
} from '@/base/Presentation/Utils/classValidation';
import { translate } from '@/locales/i18n';

import { QuoteSourceEnum } from '../constants/quote.source.enum';
import type { ExecutionQuoteType } from '../constants/execution.quote.type.enum';

export interface ExecutionQuoteAttachmentParams {
  file: string;
  alt?: string | null;
  link?: string | null;
}

/**
 * Stores the quote header and enum-backed quote type through `store_quote`.
 * Stages and items are handled by StoreExecutionQuoteDetailsParams.
 */
export default class AddExecutionQuoteParams implements Params {
  public readonly quoteSource?: number;
  public readonly projectId?: number;
  public readonly quoteType?: ExecutionQuoteType;
  public readonly priceEmployeeId?: number;

  public readonly clientExist?: boolean;
  public readonly clientId?: number;
  public readonly clientName?: string;
  public readonly clientPhone?: string;
  public readonly clientEmail?: string;
  public readonly clientAddress?: string;
  public readonly clientSourceId?: number;
  public readonly attachments?: ExecutionQuoteAttachmentParams[];

  public static readonly validation = new ClassValidation().setRules({
    quoteSource: { required: true, labelKey: 'quote_source' },
    projectId: { required: true, labelKey: 'project_id' },
    quoteType: { required: true, labelKey: 'quote_type' },
    priceEmployeeId: {
      required: (record) =>
        (record as AddExecutionQuoteParams).quoteSource !==
        QuoteSourceEnum.EXECUTION_FROM_DESIGN_QUOTE,
      labelKey: 'price_employee_id',
    },
    attachments: { required: true, labelKey: 'attachments' },
  });

  constructor(paramsData: {
    quoteSource?: number;
    projectId?: number;
    quoteType?: ExecutionQuoteType;
    priceEmployeeId?: number;
    clientExist?: boolean;
    clientId?: number;
    clientName?: string;
    clientPhone?: string;
    clientEmail?: string;
    clientAddress?: string;
    clientSourceId?: number;
    attachments?: ExecutionQuoteAttachmentParams[];
  }) {
    this.quoteSource = paramsData.quoteSource;
    this.projectId = paramsData.projectId;
    this.quoteType = paramsData.quoteType;
    this.priceEmployeeId = paramsData.priceEmployeeId;
    this.clientExist = paramsData.clientExist;
    this.clientId = paramsData.clientId;
    this.clientName = paramsData.clientName;
    this.clientPhone = paramsData.clientPhone;
    this.clientEmail = paramsData.clientEmail;
    this.clientAddress = paramsData.clientAddress;
    this.clientSourceId = paramsData.clientSourceId;
    this.attachments = paramsData.attachments;
  }

  toMap(): Record<string, unknown> {
    const payload: Record<string, unknown> = {
      project_id: this.projectId,
      quote_type: this.quoteType,
      quote_source: this.quoteSource,
    };

    if (this.clientExist !== undefined) {
      payload.client_exist = this.clientExist;
    }

    if (this.clientExist === true) {
      payload.client_id = this.clientId;
    } else if (this.clientExist === false) {
      payload.client_name = this.clientName;
      payload.client_phone = this.clientPhone;
      payload.client_email = this.clientEmail;
      payload.client_address = this.clientAddress;
      payload.client_source_id = this.clientSourceId;
    } else if (this.clientId !== undefined) {
      payload.client_id = this.clientId;
    }

    if (this.quoteSource !== QuoteSourceEnum.EXECUTION_FROM_DESIGN_QUOTE) {
      payload.price_employee_id = this.priceEmployeeId;
    }

    if (this.attachments && this.attachments.length > 0) {
      payload.attachments = this.attachments.map((attachment) => ({
        file: attachment.file,
        alt: attachment.alt ?? null,
        link: attachment.link ?? null,
      }));
    }

    return payload;
  }

  private getConditionalErrors(): FieldError[] {
    const errors: FieldError[] = [];

    if (this.clientExist === undefined && this.clientId === undefined) {
      errors.push({
        field: 'clientExist',
        message: translate('Project.validation.client_type_required'),
      });
    }

    if (this.clientExist === true && !this.clientId) {
      errors.push({
        field: 'clientId',
        message: translate('Project.validation.client_required'),
      });
    }

    if (this.clientExist === false) {
      if (!this.clientName) {
        errors.push({
          field: 'clientName',
          message: translate('validation.required', {
            field: translate('client_name'),
          }),
        });
      }
      if (!this.clientPhone) {
        errors.push({
          field: 'clientPhone',
          message: translate('validation.required', {
            field: translate('client_phone'),
          }),
        });
      }
      if (!this.clientSourceId) {
        errors.push({
          field: 'clientSourceId',
          message: translate('Project.validation.client_source_required'),
        });
      }
    }

    return errors;
  }

  validate() {
    const validation = AddExecutionQuoteParams.validation.validate(this);
    const errors = [...validation.errors, ...this.getConditionalErrors()];

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  validateOrThrow(): void {
    const validation = this.validate();

    if (!validation.isValid) {
      const validationError = new ValidationError(validation.errors);
      validationError.openDialog();
    }
  }
}
