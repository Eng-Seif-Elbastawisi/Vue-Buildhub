import {
  responseId,
  responseObject,
  responseText,
} from '../../../WorkItems/core/models/work-items.response';
import { decimalCents } from '../params/purchase-request-receipt-item.params';

export default class DisbursementStockPurchaseRequestItemModel {
  readonly id: number;
  readonly quantity: string;
  readonly title: string;

  constructor(id: number, quantity: string, title: string) {
    this.id = id;
    this.quantity = quantity;
    this.title = title;
  }

  static fromJson(payload: unknown) {
    const record = responseObject(payload);
    const quantity = responseText(record.quantity);
    if (decimalCents(quantity) === null) throw new Error('material_disbursement.invalid_response');
    return new DisbursementStockPurchaseRequestItemModel(
      responseId(record.id),
      quantity,
      responseText(record.title),
    );
  }
}
