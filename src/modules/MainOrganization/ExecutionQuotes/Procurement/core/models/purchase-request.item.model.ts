import TitleModel from '@/base/Core/Models/titleModel';
import ShopDrawingTimelineStageModel from '../../../WorkItems/core/models/shop-drawing.timeline-stage.model';
import {
  responseObject,
  responseId,
  responseText,
  nullableText,
} from '../../../WorkItems/core/models/work-items.response';
import { isItemType, type PurchaseRequestItemType } from '../constants/purchase-request.constants';

export default class PurchaseRequestItemModel {
  readonly id: number;
  readonly projectTimelineStageId: number;
  readonly projectTimelineStage: ShopDrawingTimelineStageModel | null;
  readonly itemableType: PurchaseRequestItemType;
  readonly itemableId: number;
  readonly itemable: TitleModel | null;
  readonly quantity: string | null;
  constructor(fields: {
    id: number;
    projectTimelineStageId: number;
    projectTimelineStage: ShopDrawingTimelineStageModel | null;
    itemableType: PurchaseRequestItemType;
    itemableId: number;
    itemable: TitleModel | null;
    quantity: string | null;
  }) {
    this.id = fields.id;
    this.projectTimelineStageId = fields.projectTimelineStageId;
    this.projectTimelineStage = fields.projectTimelineStage;
    this.itemableType = fields.itemableType;
    this.itemableId = fields.itemableId;
    this.itemable = fields.itemable;
    this.quantity = fields.quantity;
  }
  static fromJson(payload: unknown): PurchaseRequestItemModel {
    const record = responseObject(payload);
    if (!isItemType(record.itemable_type)) throw new Error('procurement.invalid_response');
    const itemable = record.itemable == null ? null : responseObject(record.itemable);
    if (itemable) {
      responseId(itemable.id);
      responseText(itemable.title);
    }
    const timeline =
      record.project_timeline_stage == null
        ? null
        : ShopDrawingTimelineStageModel.fromJson(record.project_timeline_stage);
    const stageId = responseId(record.project_timeline_stage_id);
    if (timeline && timeline.projectTimelineStageId !== stageId)
      throw new Error('procurement.invalid_response');
    const quantity = nullableText(record.quantity);
    if (quantity !== null && !/^\d+(\.\d+)?$/.test(quantity))
      throw new Error('procurement.invalid_response');
    return new PurchaseRequestItemModel({
      id: responseId(record.id),
      projectTimelineStageId: stageId,
      projectTimelineStage: timeline,
      itemableType: record.itemable_type,
      itemableId: responseId(record.itemable_id),
      itemable: itemable ? TitleModel.fromMap(itemable) : null,
      quantity,
    });
  }
}
