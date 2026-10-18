import TitleModel from '@/base/Core/Models/titleModel';
import {
  responseId,
  responseObject,
  responseText,
} from '../../../WorkItems/core/models/work-items.response';
import { decimalCents } from '../params/purchase-request-receipt-item.params';

export default class PurchaseRequestDisbursementHistoryItemModel {
  readonly id: number;
  readonly purchaseRequestItem: TitleModel;
  readonly quantity: string;

  constructor(id: number, purchaseRequestItem: TitleModel, quantity: string) {
    this.id = id;
    this.purchaseRequestItem = purchaseRequestItem;
    this.quantity = quantity;
  }

  static fromJson(payload: unknown) {
    const record = responseObject(payload);
    const item = responseObject(record.purchase_request_item);
    responseId(item.id);
    if (item.title !== null) responseText(item.title);
    const quantity = responseText(record.quantity);
    if (decimalCents(quantity) === null) throw new Error('material_disbursement.invalid_response');
    return new PurchaseRequestDisbursementHistoryItemModel(
      responseId(record.id),
      TitleModel.fromMap(item),
      quantity,
    );
  }
}
