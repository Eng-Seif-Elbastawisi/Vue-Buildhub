import { describe, it, expect } from 'vitest';
import AdminModel from '../admin.model';

describe('AdminModel', () => {
  const mockJson = {
    id: 1,
    name: 'Mohamed Saad',
    email: 'mohamed2@example.com',
    phone: '01012345679',
  };

  it('should create an instance correctly from constructor', () => {
    const model = new AdminModel(mockJson);

    expect(model.name).toBe('Mohamed Saad');
    expect(model.email).toBe('mohamed2@example.com');
    expect(model.phone).toBe('01012345679');
  });

  it('should create an instance correctly from fromJson', () => {
    const model = AdminModel.fromJson(mockJson);

    expect(model.id).toBe(1);
    expect(model.name).toBe('Mohamed Saad');
    expect(model.email).toBe('mohamed2@example.com');
    expect(model.phone).toBe('01012345679');
  });

  it('should throw error if json is null in fromJson', () => {
    expect(() => AdminModel.fromJson(null)).toThrow();
  });

  it('should have a valid example', () => {
    expect(AdminModel.example).toBeInstanceOf(AdminModel);
    expect(AdminModel.example.name).toBe('Mohamed Saad');
  });
});
