import { expect, it } from 'vitest';
import { requestRecord } from '../../../../Procurement/__tests__/fixtures';
import PurchaseRequestItemModel from '../../../../Procurement/core/models/purchase-request.item.model';
import PurchaseRequestReceiptHistoryItemModel from '../purchase-request-receipt-history-item.model';

it('maps the nested purchase request item with its title and independent receipt item ID', () => {
  const receiptItem = PurchaseRequestReceiptHistoryItemModel.fromJson({
    id: 5,
    purchase_request_item: requestRecord().items[0],
    quantity: '2.50',
  });
  expect(receiptItem.id).toBe(5);
  expect(receiptItem.purchaseRequestItem).toBeInstanceOf(PurchaseRequestItemModel);
  expect(receiptItem.purchaseRequestItem.id).toBe(1);
  expect(receiptItem.purchaseRequestItem.itemable?.title).toBe('Material Title');
  expect(receiptItem.quantity).toBe('2.50');
});
