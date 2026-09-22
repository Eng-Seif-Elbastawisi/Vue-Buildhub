import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';
import { translate } from '@/locales/i18n';

import type { ExecutionQuoteItemSource } from '../constants/execution.quote.item.source.enum';
import type { ExecutionQuoteType } from '../constants/execution.quote.type.enum';

export interface ExecutionQuoteItemRequest {
  sub_stage_id: number | string;
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

/**
 * Second request in the ExecutionQuotes create flow.
 * It is sent only after the base quote has already been created and returned
 * an `execution_quote_id`.
 */
export default class StoreExecutionQuoteDetailsParams implements Params {
  public readonly executionQuoteId: number;
  public readonly quoteType: ExecutionQuoteType;
  public readonly stages: ExecutionQuoteStageRequest[];

  public static readonly validation = new ClassValidation().setRules({
    executionQuoteId: { required: true, labelKey: 'execution_quote_id' },
    quoteType: { required: true, labelKey: 'execution_quote_type' },
    stages: {
      required: true,
      labelKey: 'execution_quote_stages',
      custom: (value) => Array.isArray(value) && value.length > 0,
    },
  });

  constructor(data: {
    executionQuoteId: number;
    quoteType: ExecutionQuoteType;
    stages?: ExecutionQuoteStageRequest[];
  }) {
    this.executionQuoteId = data.executionQuoteId;
    this.quoteType = data.quoteType;
    this.stages = data.stages ?? [];
  }

  toMap(): Record<string, unknown> {
    return {
      execution_quote_id: this.executionQuoteId,
      quote_type: this.quoteType,
      stages: this.stages.map((stage) => ({
        stage_id: stage.stage_id,
        client_price: stage.client_price,
        items: stage.items.map((item) => ({
          sub_stage_id: item.sub_stage_id,
          source_type: item.source_type,
          source_id: item.source_id,
          ...(item.sorting_id !== undefined && item.sorting_id !== null
            ? { sorting_id: item.sorting_id }
            : {}),
          quantity: item.quantity,
          unit_price: item.unit_price,
        })),
      })),
    };
  }

  validate() {
    const baseValidation = StoreExecutionQuoteDetailsParams.validation.validate(this);
    const itemErrors: Array<{ field: string; message: string }> = [];

    this.stages.forEach((stage, stageIndex) => {
      if (!stage.stage_id) {
        itemErrors.push({
          field: `stages.${stageIndex}.stage_id`,
          message: translate('execution_quote.validation.item_required'),
        });
      }

      if (stage.client_price === null || stage.client_price < 0) {
        itemErrors.push({
          field: `stages.${stageIndex}.client_price`,
          message: translate('execution_quote.validation.item_values'),
        });
      }

      stage.items.forEach((item, itemIndex) => {
        if (!item.sub_stage_id) {
          itemErrors.push({
            field: `stages.${stageIndex}.items.${itemIndex}.sub_stage_id`,
            message: translate('execution_quote.validation.item_required'),
          });
        }

        if (!item.source_type || !item.source_id) {
          itemErrors.push({
            field: `stages.${stageIndex}.items.${itemIndex}.source`,
            message: translate('execution_quote.validation.item_required'),
          });
        }

        if (!(item.quantity > 0)) {
          itemErrors.push({
            field: `stages.${stageIndex}.items.${itemIndex}.quantity`,
            message: translate('execution_quote.validation.item_values'),
          });
        }

        if (!(item.unit_price >= 0)) {
          itemErrors.push({
            field: `stages.${stageIndex}.items.${itemIndex}.unit_price`,
            message: translate('execution_quote.validation.item_values'),
          });
        }
      });
    });

    if (!this.stages.some((stage) => stage.items.length > 0)) {
      itemErrors.push({
        field: 'stages.items',
        message: translate('execution_quote.validation.items_required'),
      });
    }

    return {
      isValid: baseValidation.isValid && itemErrors.length === 0,
      errors: [...baseValidation.errors, ...itemErrors],
    };
  }

  validateOrThrow() {
    const validation = this.validate();

    if (!validation.isValid) {
      throw validation;
    }

    return validation;
  }
}
