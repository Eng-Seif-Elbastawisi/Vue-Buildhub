import { describe, it, expect } from 'vitest';
import IndexDocumentParams from '../index.document.params';

describe('IndexDocumentParams', () => {
  it('should create an instance with correct data', () => {
    const params = new IndexDocumentParams('search', 2, 20, 1, '2023-01-01', 5);
    expect(params.word).toBe('search');
    expect(params.pageNumber).toBe(2);
    expect(params.perPage).toBe(20);
    expect(params.withPage).toBe(1);
    expect(params.dateRemove).toBe('2023-01-01');
    expect(params.documentTypeId).toBe(5);
  });

  it('should map to an object correctly with all fields', () => {
    const params = new IndexDocumentParams('search', 2, 20, 1, '2023-01-01', 5);
    const map = params.toMap();
    expect(map.word).toBe('search');
    expect(map.page).toBe(2);
    expect(map.per_page).toBe(20);
    expect(map.with_pagination).toBe(1);
    expect(map.date_remove).toBe('2023-01-01');
    expect(map.document_type_id).toBe(5);
  });

  it('should map to an object correctly with minimal fields', () => {
    const params = new IndexDocumentParams();
    const map = params.toMap();
    expect(map.word).toBeUndefined();
    expect(map.page).toBe(1);
    expect(map.per_page).toBe(10);
    expect(map.with_pagination).toBe(1);
    expect(map.date_remove).toBeUndefined();
    expect(map.document_type_id).toBeUndefined();
  });
});
