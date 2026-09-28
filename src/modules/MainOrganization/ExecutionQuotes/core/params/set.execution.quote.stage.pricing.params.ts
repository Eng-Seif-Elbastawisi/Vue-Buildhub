import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';
import { translate } from '@/locales/i18n';

import {
  ExecutionQuoteTypeEnum,
  type ExecutionQuoteType,
} from '../constants/execution.quote.type.enum';

export const EXECUTION_QUOTE_STAGE_PRICING_MINIMUM = 1;
export const EXECUTION_QUOTE_STAGE_PERCENTAGE_MAXIMUM = 100;

const pricingValidationError = (quoteType: ExecutionQuoteType) => ({
  field: quoteType === ExecutionQuoteTypeEnum.SUPERVISION ? 'percentage' : 'client_price',
  message: translate(
    quoteType === ExecutionQuoteTypeEnum.SUPERVISION
      ? 'execution_quote.validation.percentage'
      : 'execution_quote.validation.client_price',
  ),
});

export const executionQuoteStagePricingValueIsValid = (
  quoteType: ExecutionQuoteType,
  pricingValue: unknown,
): pricingValue is number =>
  typeof pricingValue === 'number' &&
  Number.isFinite(pricingValue) &&
  pricingValue >= EXECUTION_QUOTE_STAGE_PRICING_MINIMUM &&
  (quoteType !== ExecutionQuoteTypeEnum.SUPERVISION ||
    pricingValue <= EXECUTION_QUOTE_STAGE_PERCENTAGE_MAXIMUM);

export class ExecutionQuoteStagePricingDraft {
  public readonly quoteStageId?: number;
  public readonly stageId: number;
  public readonly subStageId: number;
  public readonly quoteType: ExecutionQuoteType;
  public readonly pricingValue: number | null;

  public static readonly validation = new ClassValidation().setRules({
    stageId: { required: true, labelKey: 'stage_id' },
    subStageId: { required: true, labelKey: 'sub_stage_id' },
    quoteType: { required: true, labelKey: 'quote_type' },
  });

  constructor(params: {
    quoteStageId?: number;
    stageId: number;
    subStageId: number;
    quoteType: ExecutionQuoteType;
    pricingValue: number | null;
  }) {
    this.quoteStageId = params.quoteStageId;
    this.stageId = params.stageId;
    this.subStageId = params.subStageId;
    this.quoteType = params.quoteType;
    this.pricingValue = params.pricingValue;
  }

  toRequest(quoteStageId: number): SetExecutionQuoteStagePricingParams {
    if (!executionQuoteStagePricingValueIsValid(this.quoteType, this.pricingValue)) {
      throw this.validate();
    }

    return new SetExecutionQuoteStagePricingParams({
      quoteStageId,
      quoteType: this.quoteType,
      pricingValue: this.pricingValue,
    });
  }

  validate() {
    const draftValidation = ExecutionQuoteStagePricingDraft.validation.validate(this);
    if (executionQuoteStagePricingValueIsValid(this.quoteType, this.pricingValue)) {
      return draftValidation;
    }

    return {
      isValid: false,
      errors: [...draftValidation.errors, pricingValidationError(this.quoteType)],
    };
  }
}

export default class SetExecutionQuoteStagePricingParams implements Params {
  public readonly quoteStageId: number;
  public readonly quoteType: ExecutionQuoteType;
  public readonly pricingValue: number;

  public static readonly validation = new ClassValidation().setRules({
    quoteStageId: { required: true, labelKey: 'quote_stage_id' },
    quoteType: { required: true, labelKey: 'quote_type' },
  });

  constructor(params: {
    quoteStageId: number;
    quoteType: ExecutionQuoteType;
    pricingValue: number;
  }) {
    this.quoteStageId = params.quoteStageId;
    this.quoteType = params.quoteType;
    this.pricingValue = params.pricingValue;
  }

  toMap(): Record<string, unknown> {
    const payload: Record<string, unknown> = {
      quote_stage_id: this.quoteStageId,
      quote_type: this.quoteType,
    };

    if (this.quoteType === ExecutionQuoteTypeEnum.LUMP_SUM) {
      payload.client_price = this.pricingValue;
    } else {
      payload.percentage = this.pricingValue;
    }

    return payload;
  }

  validate() {
    const requestValidation = SetExecutionQuoteStagePricingParams.validation.validate(this);
    if (executionQuoteStagePricingValueIsValid(this.quoteType, this.pricingValue)) {
      return requestValidation;
    }

    return {
      isValid: false,
      errors: [...requestValidation.errors, pricingValidationError(this.quoteType)],
    };
  }

  validateOrThrow() {
    const validation = this.validate();

    if (!validation.isValid) throw validation;

    return validation;
  }
}
