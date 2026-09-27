import type { ExecutionQuoteItemSource } from '../../core/constants/execution.quote.item.source.enum';
import type { ExecutionQuoteStageRequest } from '../../core/params/store.execution.quote.details.params';

export interface ExecutionQuoteItemState {
  id: string;
  stage_id: number | string;
  sub_stage_id: number | string;
  source_type: ExecutionQuoteItemSource;
  source_id: number | string;
  sorting_id?: number | string | null;
  quantity: number;
  unit_price: number;
  unit_id: number;
  stage_name?: string;
  sub_stage_name?: string;
  source_title?: string;
  unit_name?: string;
  sorting_title?: string;
  persisted?: boolean;
}

export interface ExecutionQuoteStageState extends Omit<ExecutionQuoteStageRequest, 'items'> {
  stage_name?: string;
  selected_sub_stage_id?: number | string;
  percentage?: number | null;
  items: ExecutionQuoteItemState[];
}

export interface ExecutionQuoteItemDraft {
  source_id: number | string;
  sorting_id?: number | string | null;
  quantity: number;
  unit_price: number;
  unit_id: number;
  source_title?: string;
  unit_name?: string;
  sorting_title?: string;
}
