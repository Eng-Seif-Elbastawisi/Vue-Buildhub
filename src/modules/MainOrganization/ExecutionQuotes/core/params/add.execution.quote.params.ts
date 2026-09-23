import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';

import { QuoteSourceEnum } from '../constants/quote.source.enum';

/**
 * Header/base payload only.
 * This request is stored first through `store_execution_quote`.
 * The execution details (quote type + stages + items) are intentionally
 * handled by StoreExecutionQuoteDetailsParams and a separate endpoint.
 */
export default class AddExecutionQuoteParams implements Params {
  public readonly quoteSource?: number;
  public readonly projectId?: number;
  public readonly clientId?: number;
  public readonly quoteTypeId?: number;
  public readonly priceEmployeeId?: number;
  public readonly designQuoteId?: number;

  public static readonly validation = new ClassValidation().setRules({
    quoteSource: { required: true, labelKey: 'quote_source' },
    clientId: { required: true, labelKey: 'client_id' },
    projectId: { required: true, labelKey: 'project_id' },
    quoteTypeId: { required: true, labelKey: 'quote_type_id' },
    priceEmployeeId: {
      required: (record) => record.quoteSource !== QuoteSourceEnum.EXECUTION_FROM_DESIGN_QUOTE,
      labelKey: 'price_employee_id',
    },
    designQuoteId: {
      required: (record) => record.quoteSource === QuoteSourceEnum.EXECUTION_FROM_DESIGN_QUOTE,
      labelKey: 'design_quote_id',
    },
  });

  constructor(paramsData: {
    quoteSource?: number;
    projectId?: number;
    clientId?: number;
    quoteTypeId?: number;
    priceEmployeeId?: number;
    designQuoteId?: number;
  }) {
    this.quoteSource = paramsData.quoteSource;
    this.projectId = paramsData.projectId;
    this.clientId = paramsData.clientId;
    this.quoteTypeId = paramsData.quoteTypeId;
    this.priceEmployeeId = paramsData.priceEmployeeId;
    this.designQuoteId = paramsData.designQuoteId;
  }

  toMap(): Record<string, unknown> {
    const payload: Record<string, unknown> = {
      client_id: this.clientId,
      project_id: this.projectId,
      quote_type_id: this.quoteTypeId,
      quote_source: this.quoteSource,
    };

    if (this.quoteSource === QuoteSourceEnum.EXECUTION_FROM_DESIGN_QUOTE) {
      payload.design_quote_id = this.designQuoteId;
    } else {
      payload.price_employee_id = this.priceEmployeeId;
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
