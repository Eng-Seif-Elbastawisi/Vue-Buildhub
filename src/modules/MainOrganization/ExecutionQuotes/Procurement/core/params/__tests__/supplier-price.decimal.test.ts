import { expect, it } from 'vitest';
import { supplierPriceNumber } from '../supplier-price.decimal';
it.each([
  ['1500.00', 1500],
  ['200.25', 200.25],
  ['0.00', 0],
  ['0.0000001', 0.0000001],
  ['0001.250', 1.25],
])('converts %s without integer truncation or rounding', (input, expected) => {
  expect(supplierPriceNumber(input)).toBe(expected);
});
it.each(['', '-1', '1,500', '9007199254740993', '0.1234567890123456789'])(
  'refuses lossy or invalid numeric transport %s',
  (input) => {
    expect(supplierPriceNumber(input)).toBeNull();
  },
);
