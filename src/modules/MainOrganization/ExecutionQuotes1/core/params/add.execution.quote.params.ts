import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';
import { translate } from '@/locales/i18n';

import { QuoteSourceEnum } from '../constants/quote.source.enum';
import type { ExecutionQuoteItemSource } from '../constants/execution.quote.item.source.enum';
import type { ExecutionQuoteType } from '../constants/execution.quote.type.enum';

export interface ExecutionQuoteItemRequest {
  sub_stage_id: number | string;
  source_type: ExecutionQuoteItemSource;
  source_id: number | string;
  quantity: number;
  unit_price: number;
}

export interface ExecutionQuoteStageRequest {
  stage_id: number | string;
  client_price: number | null;
  items: ExecutionQuoteItemRequest[];
}

export default class AddExecutionQuoteParams implements Params {
  public readonly quoteSource?: number;
  public readonly projectId?: number;
  public readonly clientId?: number;
  public readonly quoteTypeId?: number;
  public readonly priceEmployeeId?: number;
  public readonly executionQuoteType?: ExecutionQuoteType;
  public readonly stages: ExecutionQuoteStageRequest[];

  public static readonly validation = new ClassValidation().setRules({
    clientId: { required: true, labelKey: 'client_id' },
    projectId: { required: true, labelKey: 'project_id' },
    quoteTypeId: { required: true, labelKey: 'quote_type_id' },
    priceEmployeeId: {
      required: (record) => record.quoteSource !== QuoteSourceEnum.EXECUTION_FROM_DESIGN_QUOTE,
      labelKey: 'price_employee_id',
    },
  });

  public static readonly finalValidation = new ClassValidation().setRules({
    executionQuoteType: { required: true, labelKey: 'execution_quote_type' },
    stages: {
      required: true,
      labelKey: 'execution_quote_stages',
      custom: (value) => Array.isArray(value) && value.length > 0,
    },
  });

  constructor(paramsData: {
    quoteSource?: number;
    projectId?: number;
    clientId?: number;
    quoteTypeId?: number;
    priceEmployeeId?: number;
    executionQuoteType?: ExecutionQuoteType;
    stages?: ExecutionQuoteStageRequest[];
  }) {
    this.quoteSource = paramsData.quoteSource;
    this.projectId = paramsData.projectId;
    this.clientId = paramsData.clientId;
    this.quoteTypeId = paramsData.quoteTypeId;
    this.priceEmployeeId = paramsData.priceEmployeeId;
    this.executionQuoteType = paramsData.executionQuoteType;
    this.stages = paramsData.stages ?? [];
  }

  toMap(): Record<string, unknown> {
    const payload: Record<string, unknown> = {
      client_id: this.clientId,
      project_id: this.projectId,
      quote_type_id: this.quoteTypeId,
      quote_source: this.quoteSource,
    };

    if (this.quoteSource !== QuoteSourceEnum.EXECUTION_FROM_DESIGN_QUOTE) {
      payload.price_employee_id = this.priceEmployeeId;
    }

    if (this.executionQuoteType !== undefined) {
      payload.quote_type = this.executionQuoteType;
    }

    if (this.stages.length > 0) {
      payload.stages = this.stages.map((stage) => ({
        stage_id: stage.stage_id,
        client_price: stage.client_price,
        items: stage.items.map((item) => ({
          sub_stage_id: item.sub_stage_id,
          source_type: item.source_type,
          source_id: item.source_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
        })),
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

  validateFinal() {
    const baseValidation = this.validate();
    const finalValidation = AddExecutionQuoteParams.finalValidation.validate(this);
    const itemErrors = this.stages.flatMap((stage, stageIndex) => {
      const errors = [];

      if (!stage.stage_id) {
        errors.push({
          field: `stages.${stageIndex}.stage_id`,
          message: translate('execution_quote.validation.item_required'),
        });
      }

      if (stage.client_price === null || stage.client_price < 0) {
        errors.push({
          field: `stages.${stageIndex}.client_price`,
          message: translate('execution_quote.validation.item_values'),
        });
      }

      stage.items.forEach((item, itemIndex) => {
        if (!item.sub_stage_id) {
          errors.push({
            field: `stages.${stageIndex}.items.${itemIndex}.sub_stage_id`,
            message: translate('execution_quote.validation.item_required'),
          });
        }
        if (!item.source_type || !item.source_id) {
          errors.push({
            field: `stages.${stageIndex}.items.${itemIndex}.source`,
            message: translate('execution_quote.validation.item_required'),
          });
        }
        if (!(item.quantity > 0)) {
          errors.push({
            field: `stages.${stageIndex}.items.${itemIndex}.quantity`,
            message: translate('execution_quote.validation.item_values'),
          });
        }
        if (!(item.unit_price >= 0)) {
          errors.push({
            field: `stages.${stageIndex}.items.${itemIndex}.unit_price`,
            message: translate('execution_quote.validation.item_values'),
          });
        }
      });

      return errors;
    });

    if (!this.stages.some((stage) => stage.items.length > 0)) {
      itemErrors.push({
        field: 'stages.items',
        message: translate('execution_quote.validation.items_required'),
      });
    }

    return {
      isValid: baseValidation.isValid && finalValidation.isValid && itemErrors.length === 0,
      errors: [...baseValidation.errors, ...finalValidation.errors, ...itemErrors],
    };
  }
}
