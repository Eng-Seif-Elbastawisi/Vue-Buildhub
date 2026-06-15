import { describe, it, expect } from 'vitest';
import AddDocumentParams from '../add.document.params';
import DocumentTranslationParams from '../translation.params';

const makeParams = (overrides: Partial<ConstructorParameters<typeof AddDocumentParams>[0]> = {}) =>
  new AddDocumentParams({
    title: 'Doc Title',
    refNumber: 'REF-001',
    documentTypeId: 1,
    subjects: [1, 2],
    translations: new DocumentTranslationParams({ description: { en: 'Desc', ar: 'وصف' } }),
    tags: ['tag1'],
    images: [],
    files: [],
    ...overrides,
  });

describe('AddDocumentParams', () => {
  it('should create an instance with correct data', () => {
    const params = makeParams();
    expect(params.title).toBe('Doc Title');
    expect(params.refNumber).toBe('REF-001');
    expect(params.documentTypeId).toBe(1);
    expect(params.subjects).toEqual([1, 2]);
    expect(params.tags).toEqual(['tag1']);
  });

  it('should map to an object correctly', () => {
    const params = makeParams();
    const map = params.toMap();
    expect(map.title).toBe('Doc Title');
    expect(map.refrance_number).toBe('REF-001');
    expect(map.document_type_id).toBe(1);
    expect(map.subjects).toEqual([1, 2]);
    expect(map.tags).toEqual(['tag1']);
  });

  it('should validate correctly with valid data', () => {
    const result = makeParams().validate();
    expect(result.isValid).toBe(true);
  });

  it('should fail validation with short title', () => {
    const result = makeParams({ title: 'A' }).validate();
    expect(result.isValid).toBe(false);
  });

  it('should fail validation with missing title', () => {
    const result = makeParams({ title: '' }).validate();
    expect(result.isValid).toBe(false);
  });
});
