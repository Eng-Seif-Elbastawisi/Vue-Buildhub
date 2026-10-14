import { describe, expect, it } from 'vitest';
import ProductsModel from '../products.model';

describe('ProductsModel', () => {
  it('maps a returned quantity as a number', () => {
    expect(ProductsModel.fromJson({ quantity: '10' }).quantity).toBe(10);
  });

  it.each([
    [1, true],
    ['1', true],
    [0, false],
    ['0', false],
  ])('maps API status %s to %s', (status, expectedStatus) => {
    const product = ProductsModel.fromJson({ is_active: status });

    expect(product.isActive).toBe(expectedStatus);
  });
});
