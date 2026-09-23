import type {
  ExecutionQuoteItemRequest,
  ExecutionQuoteStageRequest,
} from '../../core/params/store.execution.quote.details.params';

export interface ExecutionQuoteItemState extends ExecutionQuoteItemRequest {
  id: string;
  stage_id: number | string;
  stage_name?: string;
  sub_stage_name?: string;
  source_title?: string;
  unit_name?: string;
  sorting_title?: string;
}

export interface ExecutionQuoteStageState
  extends Omit<ExecutionQuoteStageRequest, 'items'> {
  stage_name?: string;
  selected_sub_stage_id?: number | string;
  items: ExecutionQuoteItemState[];
}

export interface ExecutionQuoteItemDraft {
  source_id: number | string;
  sorting_id?: number | string | null;
  quantity: number;
  unit_price: number;
  source_title?: string;
  unit_name?: string;
  sorting_title?: string;
}
