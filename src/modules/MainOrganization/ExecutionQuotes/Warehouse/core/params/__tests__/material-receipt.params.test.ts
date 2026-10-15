import { describe, expect, it } from 'vitest';
import PurchaseRequestReceiptItemParams, {
  decimalCents,
} from '../purchase-request-receipt-item.params';
import StorePurchaseRequestReceiptParams from '../store-purchase-request-receipt.params';
import FetchPurchaseRequestReceiptsParams from '../fetch-purchase-request-receipts.params';
import FetchPurchaseRequestReceiptsHistoryParams from '../fetch-purchase-request-receipts-history.params';

describe('material receipt request params', () => {
  it('keeps purchase-request and quote owners distinct', () => {
    expect(new FetchPurchaseRequestReceiptsParams(5).toMap()).toEqual({ purchase_request_id: 5 });
    expect(new FetchPurchaseRequestReceiptsHistoryParams(140).toMap()).toEqual({ quote_id: 140 });
  });
  it('serializes nested item subparams, date, and optional employee', () => {
    const fields = {
      purchaseRequestId: 5,
      date: '2026-10-15',
      items: [new PurchaseRequestReceiptItemParams(9, 1.25)],
    };
    const params = new StorePurchaseRequestReceiptParams(fields);
    expect(params.toMap()).toEqual({
      purchase_request_id: 5,
      date: '2026-10-15',
      items: [{ purchase_request_item_id: 9, quantity: 1.25 }],
    });
    expect(
      new StorePurchaseRequestReceiptParams({ ...fields, employeeId: null }).toMap(),
    ).toHaveProperty('employee_id', null);
    expect(
      new StorePurchaseRequestReceiptParams({ ...fields, employeeId: 7 }).toMap(),
    ).toHaveProperty('employee_id', 7);
  });
  it('omits zero and blank rows without silently rounding', () => {
    const prepared = StorePurchaseRequestReceiptParams.fromEntries({
      purchaseRequestId: 5,
      date: '2026-10-15',
      entries: [
        { purchaseRequestItemId: 9, quantity: '1.25', remainingQuantity: '4.00' },
        { purchaseRequestItemId: 10, quantity: '0.00', remainingQuantity: '5.00' },
        { purchaseRequestItemId: 11, quantity: '', remainingQuantity: '5.00' },
      ],
    });
    expect(prepared.errors).toEqual([]);
    expect(prepared.params.toMap().items).toEqual([
      { purchase_request_item_id: 9, quantity: 1.25 },
    ]);
    expect(decimalCents('1.234')).toBeNull();
    expect(decimalCents('0.01')).toBe(1);
  });
  it('rejects empty, invalid, duplicate, negative, over-remaining, and over-precision items', () => {
    const fields = { purchaseRequestId: 5, date: '2026-10-15' };
    expect(new StorePurchaseRequestReceiptParams({ ...fields, items: [] }).validate().isValid).toBe(
      false,
    );
    expect(
      new StorePurchaseRequestReceiptParams({
        ...fields,
        items: [new PurchaseRequestReceiptItemParams(9, 0)],
      }).validate().isValid,
    ).toBe(false);
    expect(
      new StorePurchaseRequestReceiptParams({
        ...fields,
        items: [
          new PurchaseRequestReceiptItemParams(9, 1),
          new PurchaseRequestReceiptItemParams(9, 1),
        ],
      }).validate().isValid,
    ).toBe(false);
    for (const quantity of ['-1', '1.234', '5.01']) {
      const prepared = StorePurchaseRequestReceiptParams.fromEntries({
        ...fields,
        entries: [{ purchaseRequestItemId: 9, quantity, remainingQuantity: '5.00' }],
      });
      expect(prepared.errors.length).toBeGreaterThan(0);
    }
    expect(
      new StorePurchaseRequestReceiptParams({
        purchaseRequestId: 5,
        date: '2026-02-30',
        items: [new PurchaseRequestReceiptItemParams(9, 1)],
      }).validate().isValid,
    ).toBe(false);
  });
});
