import { describe, it, expect } from 'vitest';
import ShowAdminParams from '../show.admin.params';

describe('ShowAdminParams', () => {
  it('should create an instance with correct data', () => {
    const params = new ShowAdminParams(1);
    expect(params.id).toBe(1);
  });

  it('should map to an object correctly', () => {
    const params = new ShowAdminParams(1);
    const map = params.toMap();
    expect(map).toEqual({
      admin_id: 1,
    });
  });

  it('should validate correctly with valid data', () => {
    const params = new ShowAdminParams(1);
    const result = params.validate();
    expect(result.isValid).toBe(true);
  });

  it('should fail validation when id is missing', () => {
    const params = new ShowAdminParams(null as any);
    const result = params.validate();
    expect(result.isValid).toBe(false);
  });
});
