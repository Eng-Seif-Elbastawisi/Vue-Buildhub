import PurchaseRequestItemModel from '../../../Procurement/core/models/purchase-request.item.model';
import { responseObject, responseText } from '../../../WorkItems/core/models/work-items.response';
import { decimalCents } from '../params/purchase-request-receipt-item.params';

export default class PurchaseRequestReceiptItemSummaryModel {
  public readonly purchaseRequestItem: PurchaseRequestItemModel;
  public readonly requestedQuantity: string;
  public readonly receivedQuantity: string;
  public readonly remainingQuantity: string;
  constructor(
    purchaseRequestItem: PurchaseRequestItemModel,
    requestedQuantity: string,
    receivedQuantity: string,
    remainingQuantity: string,
  ) {
    this.purchaseRequestItem = purchaseRequestItem;
    this.requestedQuantity = requestedQuantity;
    this.receivedQuantity = receivedQuantity;
    this.remainingQuantity = remainingQuantity;
  }
  static fromJson(payload: unknown) {
    const record = responseObject(payload);
    const requested = responseText(record.requested_quantity);
    const received = responseText(record.received_quantity);
    const remaining = responseText(record.remaining_quantity);
    if ([requested, received, remaining].some((value) => decimalCents(value) === null))
      throw new Error('material_receipt.invalid_response');
    return new PurchaseRequestReceiptItemSummaryModel(
      PurchaseRequestItemModel.fromJson(record.purchase_request_item),
      requested,
      received,
      remaining,
    );
  }
  get canReceive() {
    return (decimalCents(this.remainingQuantity) ?? 0) > 0;
  }
}
