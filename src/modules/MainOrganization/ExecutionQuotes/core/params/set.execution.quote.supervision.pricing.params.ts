import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';
import { translate } from '@/locales/i18n';

import { ExecutionQuoteTypeEnum } from '../constants/execution.quote.type.enum';
import {
  EXECUTION_QUOTE_STAGE_PERCENTAGE_MAXIMUM,
  EXECUTION_QUOTE_STAGE_PRICING_MINIMUM,
} from './set.execution.quote.stage.pricing.params';

export default class SetExecutionQuoteSupervisionPricingParams implements Params {
  public readonly quoteId: number;
  public readonly quoteType = ExecutionQuoteTypeEnum.SUPERVISION;
  public readonly percentage: number;

  public static readonly validation = new ClassValidation().setRules({
    quoteId: { required: true, labelKey: 'quote_id' },
    quoteType: { required: true, labelKey: 'quote_type' },
  });

  constructor(params: { quoteId: number; percentage: number }) {
    this.quoteId = params.quoteId;
    this.percentage = params.percentage;
  }

  toMap(): Record<string, number> {
    return {
      quote_id: this.quoteId,
      quote_type: this.quoteType,
      percentage: this.percentage,
    };
  }

  validate() {
    const requestValidation = SetExecutionQuoteSupervisionPricingParams.validation.validate(this);
    const percentageIsValid =
      Number.isFinite(this.percentage) &&
      this.percentage >= EXECUTION_QUOTE_STAGE_PRICING_MINIMUM &&
      this.percentage <= EXECUTION_QUOTE_STAGE_PERCENTAGE_MAXIMUM;

    if (percentageIsValid) return requestValidation;

    return {
      isValid: false,
      errors: [
        ...requestValidation.errors,
        {
          field: 'percentage',
          message: translate('execution_quote.validation.percentage'),
        },
      ],
    };
  }

  validateOrThrow() {
    const validation = this.validate();
    if (!validation.isValid) throw validation;
    return validation;
  }
}
