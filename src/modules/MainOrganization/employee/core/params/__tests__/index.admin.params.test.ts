import { describe, it, expect } from 'vitest';
import IndexAdminParams from '../index.admin.params';

describe('IndexAdminParams', () => {
  it('should create an instance with correct data', () => {
    const params = new IndexAdminParams('search', 2, 20, 1);
    expect(params.word).toBe('search');
    expect(params.pageNumber).toBe(2);
    expect(params.perPage).toBe(20);
    expect(params.withPage).toBe(1);
  });

  it('should map to an object correctly with all fields', () => {
    const params = new IndexAdminParams('search', 2, 20, 1);
    const map = params.toMap();
    expect(map.word).toBe('search');
    expect(map.page).toBe(2);
    expect(map.per_page).toBe(20);
    expect(map.with_pagination).toBe(1);
  });

  it('should map to an object correctly with minimal fields', () => {
    const params = new IndexAdminParams();
    const map = params.toMap();
    expect(map.word).toBeUndefined();
    expect(map.page).toBe(1);
    expect(map.per_page).toBe(10);
    expect(map.with_pagination).toBe(1);
  });
});
