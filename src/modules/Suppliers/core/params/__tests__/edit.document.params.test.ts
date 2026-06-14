import { describe, it, expect } from 'vitest';
import EditDocumentParams from '../edit.document.params';

describe('EditDocumentParams', () => {
  it('should create an instance with correct data', () => {
    const params = new EditDocumentParams({
      document_id: 10,
      title: 'Update Doc',
      subject_id: 1,
      stage_id: 2,
      unit_ids: [3],
      document_type_id: 1,
      isAllUnits: false,
    });

    expect(params.document_id).toBe(10);
    expect(params.title).toBe('Update Doc');
    expect(params.subject_id).toBe(1);
    expect(params.stage_id).toBe(2);
    expect(params.unit_ids).toEqual([3]);
    expect(params.document_type_id).toBe(1);
    expect(params.isAllUnits).toBe(false);
  });

  it('should map to an object correctly', () => {
    const params = new EditDocumentParams({
      document_id: 10,
      title: 'Update Doc',
      subject_id: 1,
      stage_id: 2,
      unit_ids: [3],
      document_type_id: 1,
      isAllUnits: false,
    });

    const map = params.toMap();
    expect(map).toEqual({
      document_id: 10,
      title: 'Update Doc',
      subject_id: 1,
      stage_id: 2,
      unit_ids: [3],
      document_type_id: 1,
      isAllUnits: false,
    });
  });

  it('should validate correctly with valid data', () => {
    const params = new EditDocumentParams({
      document_id: 10,
      title: 'Update Doc',
      subject_id: 1,
      stage_id: 2,
      unit_ids: [],
      document_type_id: 1,
      isAllUnits: true,
    });

    const result = params.validate();
    expect(result.isValid).toBe(true);
  });

  it('should fail validation with short title', () => {
    const params = new EditDocumentParams({
      document_id: 10,
      title: 'A',
      subject_id: 1,
      stage_id: 2,
      unit_ids: [],
      document_type_id: 1,
      isAllUnits: true,
    });

    const result = params.validate();
    expect(result.isValid).toBe(false);
  });
});
