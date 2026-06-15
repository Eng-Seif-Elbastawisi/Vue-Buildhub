import { describe, it, expect } from 'vitest';
import ShowDocumentParams from '../show.document.params';

describe('ShowDocumentParams', () => {
  it('should create an instance with correct data', () => {
    const params = new ShowDocumentParams({
      document_id: 1,
    });

    expect(params.document_id).toBe(1);
  });

  it('should map to an object correctly', () => {
    const params = new ShowDocumentParams({
      document_id: 1,
    });

    const map = params.toMap();
    expect(map).toEqual({
      document_id: 1,
    });
  });

  it('should validate correctly with valid data', () => {
    const params = new ShowDocumentParams({
      document_id: 1,
    });

    const result = params.validate();
    expect(result.isValid).toBe(true);
  });

  it('should fail validation when document_id is missing', () => {
    const params = new ShowDocumentParams({
      document_id: null as any,
    });

    const result = params.validate();
    expect(result.isValid).toBe(false);
  });
});
