import TitleModel from '@/base/Core/Models/titleModel';
import ShopDrawingTimelineStageModel from '../../../WorkItems/core/models/shop-drawing.timeline-stage.model';

import { isItemType, type PurchaseRequestItemType } from '../constants/purchase-request.constants';
import {
  responseObject,
  responseId,
  nullableText,
} from '../../../WorkItems/core/models/work-items.response';

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
    const stage =
      record.project_timeline_stage == null
        ? null
        : ShopDrawingTimelineStageModel.fromJson(record.project_timeline_stage);

    const itemable =
      record.itemable == null ? null : TitleModel.fromMap(responseObject(record.itemable));
    return new PurchaseRequestItemModel({
      id: responseId(record.id),
      projectTimelineStageId: stage?.projectTimelineStageId ?? 0,
      projectTimelineStage: stage,
      itemableType: record.itemable_type,
      itemableId: itemable?.id ?? 0,
      itemable,
      quantity: nullableText(record.quantity),
    });
  }
}
