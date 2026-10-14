import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';
import { validId } from '../../../Schedule/core/constants/schedule.constants';
import { isItemType, type PurchaseRequestItemType } from '../constants/purchase-request.constants';

export default class PurchaseRequestItemParams implements Params {
  public projectTimelineStageId: number;
  public itemableType: PurchaseRequestItemType;
  public itemableId: number;
  public quantity: number;
  constructor(
    projectTimelineStageId: number,
    itemableType: PurchaseRequestItemType,
    itemableId: number,
    quantity: number,
  ) {
    this.projectTimelineStageId = projectTimelineStageId;
    this.itemableType = itemableType;
    this.itemableId = itemableId;
    this.quantity = quantity;
  }
  private static validation = new ClassValidation().setRules({
    projectTimelineStageId: { required: true, custom: validId, labelKey: 'procurement_stage' },
    itemableType: { required: true, custom: isItemType, labelKey: 'procurement_item_type' },
    itemableId: { required: true, custom: validId, labelKey: 'procurement_item' },
    quantity: {
      required: true,
      labelKey: 'procurement_quantity',
      custom: (quantity: unknown) =>
        typeof quantity === 'number' &&
        Number.isFinite(quantity) &&
        quantity > 0 &&
        quantity <= 9999999999999.99 &&
        /^\d+(\.\d{1,2})?$/.test(String(quantity)),
    },
  });
  toMap() {
    return {
      project_timeline_stage_id: this.projectTimelineStageId,
      itemable_type: this.itemableType,
      itemable_id: this.itemableId,
      quantity: this.quantity,
    };
  }
  validate() {
    return PurchaseRequestItemParams.validation.validate(this);
  }
  validateOrThrow() {
    PurchaseRequestItemParams.validation.validateOrThrow(this);
  }
}
