import TitleModel from '@/base/Core/Models/titleModel';
import ShopDrawingTimelineStageModel from '../../../WorkItems/core/models/shop-drawing.timeline-stage.model';

import { type PurchaseRequestItemType } from '../constants/purchase-request.constants';

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
  static fromJson(payload: Record<string, Record<string, string | number | null | undefined> | number | string | null | undefined | ShopDrawingTimelineStageModel>): PurchaseRequestItemModel {

    return new PurchaseRequestItemModel({
      id: payload.id as number,
      projectTimelineStageId: ShopDrawingTimelineStageModel.fromJson(payload.project_timeline_stage).id as number,
      projectTimelineStage: payload.project_timeline_stage ? ShopDrawingTimelineStageModel.fromJson(payload.project_timeline_stage) : null,
      itemableType: payload.itemable_type as PurchaseRequestItemType,
      itemableId: payload.itemable?.id as number,
      itemable: payload.itemable ? TitleModel.fromMap(payload.itemable) : null,
      quantity: payload.quantity as string | null,
    });
  }
}
