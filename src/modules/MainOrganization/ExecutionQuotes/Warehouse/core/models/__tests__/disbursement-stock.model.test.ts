import { expect, it } from 'vitest';
import { stockRecord } from '../../../__tests__/disbursement-fixtures';
import DisbursementStockModel from '../disbursement-stock.model';
import DisbursementStockPurchaseRequestItemModel from '../disbursement-stock-purchase-request-item.model';

it('maps a direct stock item with decimal balances and a named nested item', () => {
  const stock = DisbursementStockModel.fromJson(stockRecord());
  expect(stock.purchaseRequestItem).toBeInstanceOf(DisbursementStockPurchaseRequestItemModel);
  expect(stock.purchaseRequestItem.id).toBe(9);
  expect([stock.receivedQuantity, stock.disbursedQuantity, stock.availableQuantity]).toEqual([
    '10.00',
    '6.00',
    '4.00',
  ]);
  expect(stock.canIssue).toBe(true);
  expect(DisbursementStockModel.fromJson(stockRecord(9, '0.00')).canIssue).toBe(false);
});
