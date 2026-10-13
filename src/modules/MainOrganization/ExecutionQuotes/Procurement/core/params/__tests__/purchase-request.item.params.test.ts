import { expect, it } from 'vitest';
import PurchaseRequestItemParams from '../purchase-request.item.params';
it('serializes the timeline association and decimal quantity without rounding', () => {
  const item = new PurchaseRequestItemParams(17, 'product', 36, 5.25);
  expect(item.validate().isValid).toBe(true);
  expect(item.toMap()).toEqual({
    project_timeline_stage_id: 17,
    itemable_type: 'product',
    itemable_id: 36,
    quantity: 5.25,
  });
});
it.each([0, -1, NaN, Infinity, 1.001, 10000000000000])(
  'rejects invalid DECIMAL(15,2) quantity %s instead of truncating it',
  (quantity) => {
    const item = new PurchaseRequestItemParams(17, 'material', 5, quantity);
    expect(item.validate().errors.map((error) => error.field)).toContain('quantity');
    expect(item.quantity).toBe(quantity);
  },
);
it.each([0.01, 0.5, 1, 10.25])('allows positive quantity %s', (quantity) =>
  expect(new PurchaseRequestItemParams(17, 'material', 5, quantity).validate().isValid).toBe(true),
);
