import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';

import { QuoteSourceEnum } from '../constants/quote.source.enum';

export default class AddExecutionQuoteParams implements Params {
  public readonly quoteSource?: number;
  public readonly projectId?: number;
  public readonly clientId?: number;
  public readonly quoteTypeId?: number;
  public readonly priceEmployeeId?: number;

  public static readonly validation = new ClassValidation().setRules({
    clientId: { required: true, labelKey: 'client_id' },
    projectId: { required: true, labelKey: 'project_id' },
    quoteTypeId: { required: true, labelKey: 'quote_type_id' },
    priceEmployeeId: {
      required: (record) => record.quoteSource !== QuoteSourceEnum.EXECUTION_FROM_DESIGN_QUOTE,
      labelKey: 'price_employee_id',
    },
  });

  constructor(paramsData: {
    quoteSource?: number;
    projectId?: number;
    clientId?: number;
    quoteTypeId?: number;
    priceEmployeeId?: number;
  }) {
    this.quoteSource = paramsData.quoteSource;
    this.projectId = paramsData.projectId;
    this.clientId = paramsData.clientId;
    this.quoteTypeId = paramsData.quoteTypeId;
    this.priceEmployeeId = paramsData.priceEmployeeId;
  }

  toMap(): Record<string, number | undefined> {
    const payload: Record<string, number | undefined> = {
      client_id: this.clientId,
      project_id: this.projectId,
      quote_type_id: this.quoteTypeId,
      quote_source: this.quoteSource,
    };

    if (this.quoteSource !== QuoteSourceEnum.EXECUTION_FROM_DESIGN_QUOTE) {
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
