import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';
import { translate } from '@/locales/i18n';

import type { ExecutionQuoteItemSource } from '../constants/execution.quote.item.source.enum';

export interface ExecutionQuoteItemRequest {
  stage_id: number | string;
  source_type: ExecutionQuoteItemSource;
  source_id: number | string;
  sorting_id?: number | string | null;
  quantity: number;
  unit_price: number;
}

export interface ExecutionQuoteStageRequest {
  stage_id: number | string;
  client_price: number | null;
  items: ExecutionQuoteItemRequest[];
}

export interface ExecutionQuoteMorphItemRequest {
  morphId: number;
  expectedPrice: number;
  quantity: number;
  unit: number;
}

export default class StoreExecutionQuoteDetailsParams implements Params {
  public readonly quoteId: number;
  public readonly stageId: number;
  public readonly subStageId: number;
  public readonly itemType: ExecutionQuoteItemSource;
  public readonly clientPrice: number | null;
  public readonly items: ExecutionQuoteMorphItemRequest[];

  public static readonly validation = new ClassValidation().setRules({
    quoteId: { required: true, labelKey: 'quote_id' },
    stageId: { required: true, labelKey: 'stage_id' },
    subStageId: { required: true, labelKey: 'sub_stage_id' },
    itemType: { required: true, labelKey: 'item_type' },
    items: {
      required: true,
      labelKey: 'items',
      custom: (items) => Array.isArray(items) && items.length > 0,
    },
  });

  constructor(params: {
    quoteId: number;
    stageId: number;
    subStageId: number;
    itemType: ExecutionQuoteItemSource;
    clientPrice: number | null;
    items: ExecutionQuoteMorphItemRequest[];
  }) {
    this.quoteId = params.quoteId;
    this.stageId = params.stageId;
    this.subStageId = params.subStageId;
    this.itemType = params.itemType;
    this.clientPrice = params.clientPrice;
    this.items = params.items;
  }

  toMap(): Record<string, unknown> {
    return {
      quote_id: this.quoteId,
      stage_id: this.stageId,
      sub_stage_id: this.subStageId,
      item_type: this.itemType,
      client_price: this.clientPrice,
      items: this.items.map((morphItem) => ({
        morph_id: morphItem.morphId,
        expected_price: morphItem.expectedPrice,
        quantity: morphItem.quantity,
        unit: morphItem.unit,
      })),
    };
  }

  validate() {
    const requestValidation = StoreExecutionQuoteDetailsParams.validation.validate(this);
    const itemErrors: Array<{ field: string; message: string }> = [];

    if (this.clientPrice !== null && (!Number.isFinite(this.clientPrice) || this.clientPrice < 0)) {
      itemErrors.push({
        field: 'client_price',
        message: translate('execution_quote.validation.client_price'),
      });
    }

    this.items.forEach((morphItem, itemIndex) => {
      if (!morphItem.morphId) {
        itemErrors.push({
          field: `items.${itemIndex}.morph_id`,
          message: translate('execution_quote.validation.item_required'),
        });
      }

      if (!Number.isInteger(morphItem.unit) || morphItem.unit <= 0) {
        itemErrors.push({
          field: `items.${itemIndex}.unit`,
          message: translate('execution_quote.validation.item_required'),
        });
      }

      if (!(morphItem.quantity > 0) || !(morphItem.expectedPrice >= 0)) {
        itemErrors.push({
          field: `items.${itemIndex}.values`,
          message: translate('execution_quote.validation.item_values'),
        });
      }
    });

    return {
      isValid: requestValidation.isValid && itemErrors.length === 0,
      errors: [...requestValidation.errors, ...itemErrors],
    };
  }

  validateOrThrow() {
    const validation = this.validate();

    if (!validation.isValid) throw validation;

    return validation;
  }
}
