import TitleModel from '@/base/Core/Models/titleModel';
import PurchaseRequestItemModel from '../../../Procurement/core/models/purchase-request.item.model';
import {
  responseObject,
  responseId,
  responseText,
} from '../../../WorkItems/core/models/work-items.response';
import { decimalCents } from '../params/purchase-request-receipt-item.params';
export default class PurchaseRequestReceiptHistoryItemModel {
  public readonly id: number;
  public readonly purchaseRequestItem: TitleModel;
  public readonly quantity: string;
  constructor(id: number, purchaseRequestItem: TitleModel, quantity: string) {
    this.id = id;
    this.purchaseRequestItem = purchaseRequestItem;
    this.quantity = quantity;
  }
  static fromJson(payload: unknown) {
    const record = responseObject(payload);
    const quantity = responseText(record.quantity);
    if (decimalCents(quantity) === null) throw new Error('material_receipt.invalid_response');
    return new PurchaseRequestReceiptHistoryItemModel(
      responseId(record.id),
      TitleModel.fromMap(record.purchase_request_item),
      quantity,
    );
  }
}
