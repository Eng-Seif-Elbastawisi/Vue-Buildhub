import { describe, it, expect } from 'vitest';
import DeleteAdminParams from '../delete.admin.params';

describe('DeleteAdminParams', () => {
  it('should create an instance with correct data', () => {
    const params = new DeleteAdminParams(1);
    expect(params.id).toBe(1);
  });

  it('should map to an object correctly', () => {
    const params = new DeleteAdminParams(1);
    const map = params.toMap();
    expect(map).toEqual({
      admin_id: 1,
    });
  });

  it('should validate correctly with valid data', () => {
    const params = new DeleteAdminParams(1);
    const result = params.validate();
    expect(result.isValid).toBe(true);
  });

  it('should fail validation when id is missing/invalid', () => {
    const params = new DeleteAdminParams(null as any);
    const result = params.validate();
    expect(result.isValid).toBe(false);
  });
});
