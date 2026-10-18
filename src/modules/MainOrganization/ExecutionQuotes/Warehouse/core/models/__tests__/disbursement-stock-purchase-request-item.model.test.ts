import { expect, it } from 'vitest';
import DisbursementStockPurchaseRequestItemModel from '../disbursement-stock-purchase-request-item.model';

it('preserves the requested decimal string in the compact stock item reference', () => {
  const item = DisbursementStockPurchaseRequestItemModel.fromJson({
    id: 9,
    title: 'run',
    quantity: '10.00',
  });
  expect(item).toMatchObject({ id: 9, title: 'run', quantity: '10.00' });
  expect(() =>
    DisbursementStockPurchaseRequestItemModel.fromJson({ id: 9, title: 'run', quantity: 10 }),
  ).toThrow();
});
