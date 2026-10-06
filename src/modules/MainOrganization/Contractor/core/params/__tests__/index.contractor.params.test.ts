import { describe, expect, it } from 'vitest';
import IndexContractorParams from '../index.contractor.params';

describe('IndexContractorParams', () => {
  it('passes search and page through the shared index params', () => {
    expect(new IndexContractorParams('steel', 2, 10, 1).toMap()).toMatchObject({
      word: 'steel',
      page: 2,
    });
  });
});
