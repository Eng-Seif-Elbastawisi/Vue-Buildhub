import { describe, expect, it } from 'vitest';
import IndexInvoiceParams from '../index.invoice.params';

describe('IndexInvoiceParams', () => {
  it('adds project_id filter when provided', () => {
    expect(new IndexInvoiceParams('INV', 2, 20, 1, 10).toMap()).toMatchObject({
      word: 'INV',
      page: 2,
      per_page: 20,
      with_pagination: 1,
      project_id: 10,
    });
  });
});
