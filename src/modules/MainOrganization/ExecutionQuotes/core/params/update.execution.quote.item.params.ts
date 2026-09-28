import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';
import { translate } from '@/locales/i18n';

import type { ExecutionQuoteItemSource } from '../constants/execution.quote.item.source.enum';

export default class UpdateExecutionQuoteItemParams implements Params {
  public readonly quoteItemId: number;
  public readonly itemType: ExecutionQuoteItemSource;
  public readonly morphId: number;
  public readonly expectedPrice: number;
  public readonly quantity: number;
  public readonly unit: number;

  public static readonly validation = new ClassValidation().setRules({
    quoteItemId: {
      required: true,
      custom: (value) => Number.isInteger(value) && value > 0,
    },
    itemType: {
      required: true,
      custom: (value) => Number.isInteger(value) && value > 0,
    },
    morphId: {
      required: true,
      custom: (value) => Number.isInteger(value) && value > 0,
    },
    expectedPrice: {
      required: true,
      custom: (value) =>
        (typeof value === 'number' && Number.isFinite(value) && value >= 0) ||
        translate('execution_quote.validation.item_values'),
    },
    quantity: {
      required: true,
      custom: (value) =>
        (typeof value === 'number' && Number.isFinite(value) && value > 0) ||
        translate('execution_quote.validation.item_values'),
    },
    unit: {
      required: true,
      custom: (value) => Number.isInteger(value) && value > 0,
    },
  });

  constructor(data: {
    quoteItemId: number;
    itemType: ExecutionQuoteItemSource;
    morphId: number;
    expectedPrice: number;
    quantity: number;
    unit: number;
  }) {
    this.quoteItemId = data.quoteItemId;
    this.itemType = data.itemType;
    this.morphId = data.morphId;
    this.expectedPrice = data.expectedPrice;
    this.quantity = data.quantity;
    this.unit = data.unit;
  }

  toMap(): Record<string, number> {
    return {
      quote_stage_item_id: this.quoteItemId,
      item_type: this.itemType,
      morph_id: this.morphId,
      expected_price: this.expectedPrice,
      quantity: this.quantity,
      unit: this.unit,
    };
  }

  validate() {
    return UpdateExecutionQuoteItemParams.validation.validate(this);
  }

  validateOrThrow() {
    return UpdateExecutionQuoteItemParams.validation.validateOrThrow(this);
  }
}
