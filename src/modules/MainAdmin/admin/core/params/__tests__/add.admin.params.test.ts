import { describe, it, expect } from 'vitest';
import AddAdminParams from '../add.admin.params';

const makeParams = (overrides: Partial<ConstructorParameters<typeof AddAdminParams>[0]> = {}) =>
  new AddAdminParams({
    name: 'Admin Name',
    email: 'admin@example.com',
    phone: '1234567890',
    password: 'password123',
    ...overrides,
  });

describe('AddAdminParams', () => {
  it('should create an instance with correct data', () => {
    const params = makeParams();
    expect(params.name).toBe('Admin Name');
    expect(params.email).toBe('admin@example.com');
    expect(params.phone).toBe('1234567890');
    expect(params.password).toBe('password123');
  });

  it('should map to an object correctly', () => {
    const params = makeParams();
    const map = params.toMap();
    expect(map).toEqual({
      name: 'Admin Name',
      email: 'admin@example.com',
      phone: '1234567890',
      password: 'password123',
    });
  });

  it('should validate correctly with valid data', () => {
    const result = makeParams().validate();
    expect(result.isValid).toBe(true);
  });

  it('should fail validation with short name', () => {
    const result = makeParams({ name: 'A' }).validate();
    expect(result.isValid).toBe(false);
  });

  it('should fail validation with missing name', () => {
    const result = makeParams({ name: '' }).validate();
    expect(result.isValid).toBe(false);
  });

  it('should fail validation with short password', () => {
    const result = makeParams({ password: '123' }).validate();
    expect(result.isValid).toBe(false);
  });
});
