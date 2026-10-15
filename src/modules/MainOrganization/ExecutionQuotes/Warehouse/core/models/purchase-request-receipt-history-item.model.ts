import {
  responseObject,
  responseId,
  responseText,
} from '../../../WorkItems/core/models/work-items.response';
import { decimalCents } from '../params/purchase-request-receipt-item.params';
export default class PurchaseRequestReceiptHistoryItemModel {
  public readonly id: number;
  public readonly purchaseRequestItemId: number;
  public readonly quantity: string;
  constructor(id: number, purchaseRequestItemId: number, quantity: string) {
    this.id = id;
    this.purchaseRequestItemId = purchaseRequestItemId;
    this.quantity = quantity;
  }
  static fromJson(payload: unknown) {
    const record = responseObject(payload);
    const quantity = responseText(record.quantity);
    if (decimalCents(quantity) === null) throw new Error('material_receipt.invalid_response');
    return new PurchaseRequestReceiptHistoryItemModel(
      responseId(record.id),
      responseId(record.purchase_request_item_id),
      quantity,
    );
  }
}
