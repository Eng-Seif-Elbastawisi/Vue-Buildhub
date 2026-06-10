import { describe, it, expect } from 'vitest';
import IndexFaqsParams from '../index.faqs.params';

describe('IndexFaqsParams', () => {
  it('constructs with default values', () => {
    const params = new IndexFaqsParams();
    expect(params.word).toBe('');
    expect(params.pageNumber).toBe(1);
    expect(params.perPage).toBe(10);
    expect(params.withPage).toBe(1);
  });

  it('constructs with custom values', () => {
    const params = new IndexFaqsParams('search', 2, 20, 1);
    expect(params.word).toBe('search');
    expect(params.pageNumber).toBe(2);
    expect(params.perPage).toBe(20);
  });

  it('toMap includes with_pagination, page, per_page', () => {
    const params = new IndexFaqsParams('', 3, 15);
    const map = params.toMap();
    expect(map.with_pagination).toBe(1);
    expect(map.page).toBe(3);
    expect(map.per_page).toBe(15);
  });

  it('toMap omits word when empty', () => {
    const params = new IndexFaqsParams('');
    expect(params.toMap()).not.toHaveProperty('word');
  });

  it('toMap includes word when non-empty', () => {
    const params = new IndexFaqsParams('vue');
    expect(params.toMap().word).toBe('vue');
  });

  it('validate returns isValid:true with defaults', () => {
    expect(new IndexFaqsParams().validate().isValid).toBe(true);
  });
});
