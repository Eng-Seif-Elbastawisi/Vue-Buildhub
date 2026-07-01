import { describe, it, expect } from 'vitest';
import EditAdminParams from '../edit.admin.params';

describe('EditAdminParams', () => {
  it('should create an instance with correct data', () => {
    const params = new EditAdminParams({
      id: 10,
      name: 'Update Name',
      email: 'test@example.com',
      phone: '1234567890',
    });

    expect(params.id).toBe(10);
    expect(params.name).toBe('Update Name');
    expect(params.email).toBe('test@example.com');
    expect(params.phone).toBe('1234567890');
    expect(params.password).toBeUndefined();
  });

  it('should create an instance with password', () => {
    const params = new EditAdminParams({
      id: 10,
      name: 'Update Name',
      email: 'test@example.com',
      phone: '1234567890',
      password: 'secret123',
    });

    expect(params.password).toBe('secret123');
  });

  it('should map to an object correctly', () => {
    const params = new EditAdminParams({
      id: 10,
      name: 'Update Name',
      email: 'test@example.com',
      phone: '1234567890',
      password: 'secret123',
    });

    const map = params.toMap();
    expect(map).toEqual({
      admin_id: 10,
      name: 'Update Name',
      email: 'test@example.com',
      phone: '1234567890',
      password: 'secret123',
    });
  });

  it('should validate correctly with valid data', () => {
    const params = new EditAdminParams({
      id: 10,
      name: 'Update Name',
      email: 'test@example.com',
      phone: '1234567890',
    });

    const result = params.validate();
    expect(result.isValid).toBe(true);
  });

  it('should fail validation with short name', () => {
    const params = new EditAdminParams({
      id: 10,
      name: 'A',
      email: 'test@example.com',
      phone: '1234567890',
    });

    const result = params.validate();
    expect(result.isValid).toBe(false);
  });
});
