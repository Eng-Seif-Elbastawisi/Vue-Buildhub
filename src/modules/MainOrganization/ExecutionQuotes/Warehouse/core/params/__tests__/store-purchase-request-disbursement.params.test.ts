import { expect, it } from 'vitest';
import PurchaseRequestDisbursementItemParams from '../purchase-request-disbursement-item.params';
import StorePurchaseRequestDisbursementParams from '../store-purchase-request-disbursement.params';

const entries = () => [
  { purchaseRequestItemId: 9, selected: true, quantity: '1.25', availableQuantity: '4.00' },
  { purchaseRequestItemId: 10, selected: true, quantity: '0', availableQuantity: '3.00' },
  { purchaseRequestItemId: 11, selected: false, quantity: '2', availableQuantity: '3.00' },
];

it('omits zero and unselected rows and serializes only named item subparams', () => {
  const prepared = StorePurchaseRequestDisbursementParams.fromEntries({
    quoteId: 140,
    receiverId: 7,
    date: '2026-10-15',
    entries: entries(),
  });
  expect(prepared.errors).toEqual([]);
  expect(prepared.params.items[0]).toBeInstanceOf(PurchaseRequestDisbursementItemParams);
  expect(prepared.params.validate().isValid).toBe(true);
  expect(prepared.params.toMap()).toEqual({
    quote_id: 140,
    receiver_id: 7,
    date: '2026-10-15',
    items: [{ purchase_request_item_id: 9, quantity: 1.25 }],
  });
});

it('preserves explicit optional fields and null notes', () => {
  const params = new StorePurchaseRequestDisbursementParams({
    quoteId: 140,
    receiverId: 7,
    type: 1,
    date: '2026-10-15',
    notes: null,
    items: [new PurchaseRequestDisbursementItemParams(9, 1)],
  });
  expect(params.toMap()).toMatchObject({ type: 1, notes: null });
});

it('rejects missing receiver, invalid date, empty items, and duplicate IDs', () => {
  const invalid = new StorePurchaseRequestDisbursementParams({
    quoteId: 140,
    receiverId: 0,
    date: '2026-02-30',
    items: [
      new PurchaseRequestDisbursementItemParams(9, 1),
      new PurchaseRequestDisbursementItemParams(9, 2),
    ],
  });
  expect(invalid.validate().isValid).toBe(false);
  expect(
    invalid
      .validate()
      .errors.some((error) => error.message === 'material_disbursement.duplicate_item'),
  ).toBe(true);
  expect(
    new StorePurchaseRequestDisbursementParams({
      quoteId: 140,
      receiverId: 7,
      date: '2026-10-15',
      items: [],
    }).validate().isValid,
  ).toBe(false);
});

it.each(['-1', '1.234', '4.01'])(
  'rejects an invalid or above-available entered quantity %s',
  (quantity) => {
    const prepared = StorePurchaseRequestDisbursementParams.fromEntries({
      quoteId: 140,
      receiverId: 7,
      date: '2026-10-15',
      entries: [{ purchaseRequestItemId: 9, selected: true, quantity, availableQuantity: '4.00' }],
    });
    expect(prepared.errors).toContain('material_disbursement.invalid_quantity');
    expect(prepared.params.items).toEqual([]);
  },
);

it('does not submit an empty item array after zero rows are omitted', () => {
  const prepared = StorePurchaseRequestDisbursementParams.fromEntries({
    quoteId: 140,
    receiverId: 7,
    date: '2026-10-15',
    entries: [
      { purchaseRequestItemId: 9, selected: true, quantity: '0.00', availableQuantity: '4.00' },
    ],
  });
  expect(prepared.params.validate().isValid).toBe(false);
  expect(prepared.params.items).toEqual([]);
});
