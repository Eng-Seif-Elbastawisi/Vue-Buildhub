import { describe, expect, it } from 'vitest';
import ProductsShowModel from '../products.show.model';

describe('ProductsShowModel', () => {
  it.each([
    [1, true],
    ['1', true],
    [0, false],
    ['0', false],
  ])('maps API status %s to %s', (status, expectedStatus) => {
    const product = ProductsShowModel.fromJson({ is_active: status });

    expect(product.isActive).toBe(expectedStatus);
  });
});
