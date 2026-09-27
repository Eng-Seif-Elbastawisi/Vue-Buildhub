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

  it('exposes the product code and all attachments returned by the API', () => {
    const product = ProductsShowModel.fromJson({
      code: 'P-001',
      attachments: [
        { id: 1, file: 'https://assets.test/product.webp', type: 1 },
        { id: 2, file: 'https://assets.test/specification.pdf', type: 2 },
      ],
    });

    expect(product.code).toBe('P-001');
    expect(product.image).toBe('https://assets.test/product.webp');
    expect(product.attachments).toHaveLength(2);
    expect(product.attachments[1]).toMatchObject({
      id: 2,
      file: 'https://assets.test/specification.pdf',
      type: 2,
    });
  });
});
