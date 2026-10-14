import { expect, it } from 'vitest';
import Model from '../purchase.order.price.model';
it('preserves decimal strings and validates duration units', () => {
  expect(Model.fromJson({ id: 4, price: '1500.00', duration: 2, duration_type: 2 }).price).toBe(
    '1500.00',
  );
  expect(() =>
    Model.fromJson({ id: 4, price: '1500.00', duration: 2, duration_type: 8 }),
  ).toThrow();
});
