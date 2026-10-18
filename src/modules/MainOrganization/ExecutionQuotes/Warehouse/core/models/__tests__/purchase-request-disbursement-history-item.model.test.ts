import { expect, it } from 'vitest';
import TitleModel from '@/base/Core/Models/titleModel';
import PurchaseRequestDisbursementHistoryItemModel from '../purchase-request-disbursement-history-item.model';

it('keeps the disbursement line ID distinct from the original purchase request item ID', () => {
  const item = PurchaseRequestDisbursementHistoryItemModel.fromJson({
    id: 3,
    purchase_request_item: { id: 9, title: 'run' },
    quantity: '1.50',
  });
  expect(item.id).toBe(3);
  expect(item.purchaseRequestItem).toBeInstanceOf(TitleModel);
  expect(item.purchaseRequestItem.id).toBe(9);
  expect(item.quantity).toBe('1.50');
});
