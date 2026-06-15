import { describe, it, expect } from 'vitest';
import DeleteDocumentParams from '../delete.document.params';

describe('DeleteDocumentParams', () => {
  it('should create an instance with correct data', () => {
    const params = new DeleteDocumentParams({
      document_id: 1,
    });

    expect(params.document_id).toBe(1);
  });

  it('should map to an object correctly', () => {
    const params = new DeleteDocumentParams({
      document_id: 1,
    });

    const map = params.toMap();
    expect(map).toEqual({
      document_id: 1,
    });
  });

  it('should validate correctly with valid data', () => {
    const params = new DeleteDocumentParams({
      document_id: 1,
    });

    const result = params.validate();
    expect(result.isValid).toBe(true);
  });

  it('should fail validation when document_id is missing/invalid according to rules (if configured properly)', () => {
    const params = new DeleteDocumentParams({
      document_id: null as any,
    });

    const result = params.validate();
    expect(result.isValid).toBe(false);
  });
});
