import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';

import { QuoteSourceEnum } from '../constants/quote.source.enum';

export interface ExecutionQuoteAttachmentRequest {
  file: string;
  alt: string;
}

export default class AddExecutionQuoteParams implements Params {

  public readonly quoteSource?: number;

  public readonly projectId?: number;

  public readonly clientExist?: boolean;

  public readonly clientId?: number;

  public readonly clientName?: string;

  public readonly clientPhone?: string;

  public readonly clientEmail?: string;

  public readonly clientAddress?: string;

  public readonly clientSourceId?: number;


  public readonly employeeExist?: boolean;

  public readonly employeeId?: number;

  public readonly employeeName?: string;

  public readonly employeePhone?: string;


  public readonly projectTypeId?: number;

  public readonly quoteTypeId?: number;

  public readonly attachments?: ExecutionQuoteAttachmentRequest[];


  public static readonly validation = new ClassValidation().setRules({
    quoteSource: { required: true, labelKey: 'quote_source' },
    projectId: { required: true, labelKey: 'project_id' },
    quoteTypeId: { required: true, labelKey: 'quote_type_id' },
  });


  constructor(paramsData: {

    quoteSource?: number;

    projectId?: number;


    clientExist?: boolean;

    clientId?: number;

    clientName?: string;

    clientPhone?: string;

    clientEmail?: string;

    clientAddress?: string;

    clientSourceId?: number;


    employeeExist?: boolean;

    employeeId?: number;

    employeeName?: string;

    employeePhone?: string;


    quoteTypeId?: number;

    attachments?: ExecutionQuoteAttachmentRequest[];

  }) {

    this.quoteSource = paramsData.quoteSource;

    this.projectId = paramsData.projectId;


    this.clientExist = paramsData.clientExist;

    this.clientId = paramsData.clientId;

    this.clientName = paramsData.clientName;

    this.clientPhone = paramsData.clientPhone;

    this.clientEmail = paramsData.clientEmail;

    this.clientAddress = paramsData.clientAddress;

    this.clientSourceId = paramsData.clientSourceId;


    this.employeeExist = paramsData.employeeExist;

    this.employeeId = paramsData.employeeId;

    this.employeeName = paramsData.employeeName;

    this.employeePhone = paramsData.employeePhone;


    this.quoteTypeId = paramsData.quoteTypeId;

    this.attachments = paramsData.attachments;

  }


  toMap(): Record<string, unknown> {

    const payload: Record<string, unknown> = {

      quote_source: this.quoteSource,

      project_id: this.projectId,

      quote_type_id: this.quoteTypeId,

    };


    /**
     * Client
     */
    if (this.clientExist !== undefined) {

      payload.client_exist = this.clientExist;


      if (this.clientExist) {

        payload.client_id = this.clientId;

      } else {

        payload.client_name = this.clientName;

        payload.client_phone = this.clientPhone;

        payload.client_email = this.clientEmail;

        payload.client_address = this.clientAddress;

        payload.client_source_id = this.clientSourceId;

      }

    }


    /**
     * Employee
     */
    if (this.employeeExist !== undefined) {

      payload.employee_exist = this.employeeExist;


      if (this.employeeExist) {

        payload.employee_id = this.employeeId;

      } else {

        payload.employee_name = this.employeeName;

        payload.employee_phone = this.employeePhone;

      }

    }


    if (this.attachments?.length) {

      payload.attachments = this.attachments.map((attachment) => ({
        ...attachment,
      }));

    }


    return payload;

  }


  validate() {

    return AddExecutionQuoteParams.validation.validate(this);

  }


  validateOrThrow() {

    return AddExecutionQuoteParams.validation.validateOrThrow(this);

  }

}