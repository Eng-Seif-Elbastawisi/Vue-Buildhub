import { describe, it, expect } from 'vitest';
import UserModel from '../user.model';
import { EmailType } from '../../constants/emailType.enum';

describe('UserModel', () => {
  const baseData = {
    id: 1,
    name: 'Ahmed Ali',
    email: 'ahmed@example.com',
    type: EmailType.EMPLOYEE,
    employeeId: 10,
    createdAt: '2024-01-01',
    updatedAt: '2024-06-01',
    apiToken: 'token-abc',
    refreshToken: 'refresh-xyz',
  };

  describe('constructor', () => {
    it('should assign all fields correctly', () => {
      const model = new UserModel(baseData);
      expect(model.id).toBe(1);
      expect(model.name).toBe('Ahmed Ali');
      expect(model.email).toBe('ahmed@example.com');
      expect(model.type).toBe(EmailType.EMPLOYEE);
      expect(model.employeeId).toBe(10);
      expect(model.createdAt).toBe('2024-01-01');
      expect(model.updatedAt).toBe('2024-06-01');
      expect(model.apiToken).toBe('token-abc');
      expect(model.refreshToken).toBe('refresh-xyz');
    });

    it('should default type to EMPLOYEE when not provided', () => {
      const model = new UserModel({ name: 'Sara', email: 'sara@example.com' });
      expect(model.type).toBe(EmailType.EMPLOYEE);
    });

    it('should allow optional fields to be undefined', () => {
      const model = new UserModel({ name: 'Minimal', email: 'min@example.com' });
      expect(model.id).toBeUndefined();
      expect(model.employeeId).toBeUndefined();
      expect(model.apiToken).toBeUndefined();
      expect(model.refreshToken).toBeUndefined();
    });
  });

  describe('fromJson', () => {
    it('should parse a full API response correctly', () => {
      const json = {
        id: 5,
        name: 'Hana',
        email: 'hana@example.com',
        type: EmailType.WORK,
        employee_id: 42,
        created_at: '2024-02-01',
        updated_at: '2024-07-01',
        api_token: 'jwt-token',
        refresh_token: 'ref-token',
      };
      const model = UserModel.fromJson(json);
      expect(model.id).toBe(5);
      expect(model.name).toBe('Hana');
      expect(model.email).toBe('hana@example.com');
      expect(model.type).toBe(EmailType.WORK);
      expect(model.employeeId).toBe(42);
      expect(model.apiToken).toBe('jwt-token');
      expect(model.refreshToken).toBe('ref-token');
    });

    it('should throw when json is null', () => {
      expect(() => UserModel.fromJson(null)).toThrow();
    });

    it('should default type to EMPLOYEE when not in json', () => {
      const model = UserModel.fromJson({ name: 'Test', email: 't@t.com' });
      expect(model.type).toBe(EmailType.EMPLOYEE);
    });
  });

  describe('toJson', () => {
    it('should serialize to snake_case keys', () => {
      const model = new UserModel(baseData);
      const json = model.toJson();
      expect(json.id).toBe(1);
      expect(json.name).toBe('Ahmed Ali');
      expect(json.email).toBe('ahmed@example.com');
      expect(json.type).toBe(EmailType.EMPLOYEE);
      expect(json.employee_id).toBe(10);
      expect(json.created_at).toBe('2024-01-01');
      expect(json.updated_at).toBe('2024-06-01');
      expect(json.api_token).toBe('token-abc');
      expect(json.refresh_token).toBe('refresh-xyz');
    });
  });

  describe('example', () => {
    it('should return a valid UserModel instance', () => {
      const ex = UserModel.example;
      expect(ex).toBeInstanceOf(UserModel);
      expect(ex.name).toBe('Omar Mostafa');
      expect(ex.type).toBe(EmailType.EMPLOYEE);
      expect(ex.apiToken).toBeTruthy();
    });
  });

  describe('business logic helpers', () => {
    it('isValidEmail should return true for a valid email', () => {
      const model = new UserModel({ name: 'X', email: 'valid@example.com' });
      expect(model.isValidEmail()).toBe(true);
    });

    it('isValidEmail should return false for an invalid email', () => {
      const model = new UserModel({ name: 'X', email: 'not-an-email' });
      expect(model.isValidEmail()).toBe(false);
    });

    it('belongsToEmployee should match the correct employee id', () => {
      const model = new UserModel({ name: 'X', email: 'x@x.com', employeeId: 7 });
      expect(model.belongsToEmployee(7)).toBe(true);
      expect(model.belongsToEmployee(99)).toBe(false);
    });

    it('isWorkEmail should return true for WORK type', () => {
      const model = new UserModel({ name: 'X', email: 'x@x.com', type: EmailType.WORK });
      expect(model.isWorkEmail()).toBe(true);
      expect(model.isPersonalEmail()).toBe(false);
    });

    it('isPersonalEmail should return true for PERSONAL type', () => {
      const model = new UserModel({ name: 'X', email: 'x@x.com', type: EmailType.PERSONAL });
      expect(model.isPersonalEmail()).toBe(true);
      expect(model.isWorkEmail()).toBe(false);
    });

    it('toString should return formatted string', () => {
      const model = new UserModel({
        name: 'X',
        email: 'x@x.com',
        type: EmailType.EMPLOYEE,
      });
      expect(model.toString()).toBe(`x@x.com (${EmailType.EMPLOYEE})`);
    });
  });
});
