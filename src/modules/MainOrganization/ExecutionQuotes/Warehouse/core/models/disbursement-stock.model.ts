import { responseObject, responseText } from '../../../WorkItems/core/models/work-items.response';
import { decimalCents } from '../params/purchase-request-receipt-item.params';
import DisbursementStockPurchaseRequestItemModel from './disbursement-stock-purchase-request-item.model';

export default class DisbursementStockModel {
  readonly purchaseRequestItem: DisbursementStockPurchaseRequestItemModel;
  readonly receivedQuantity: string;
  readonly disbursedQuantity: string;
  readonly availableQuantity: string;

  constructor(
    purchaseRequestItem: DisbursementStockPurchaseRequestItemModel,
    receivedQuantity: string,
    disbursedQuantity: string,
    availableQuantity: string,
  ) {
    this.purchaseRequestItem = purchaseRequestItem;
    this.receivedQuantity = receivedQuantity;
    this.disbursedQuantity = disbursedQuantity;
    this.availableQuantity = availableQuantity;
  }

  static fromJson(payload: unknown) {
    const record = responseObject(payload);
    const received = responseText(record.received_quantity);
    const disbursed = responseText(record.disbursed_quantity);
    const available = responseText(record.available_quantity);
    if ([received, disbursed, available].some((value) => decimalCents(value) === null))
      throw new Error('material_disbursement.invalid_response');
    return new DisbursementStockModel(
      DisbursementStockPurchaseRequestItemModel.fromJson(record.purchase_request_item),
      received,
      disbursed,
      available,
    );
  }

  get canIssue() {
    return (decimalCents(this.availableQuantity) ?? 0) > 0;
  }
}
